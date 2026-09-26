"""
Federated Learning Client for Credit Card Fraud Detection
==========================================================
Implements the Flower (flwr) NumPyClient interface for decentralized training
and evaluation of the FraudDetectionModel on local bank datasets.

Features:
- get_parameters / set_parameters: Seamless conversion between PyTorch state_dict and NumPy arrays.
- FraudFlowerClient: Flower client executing local training rounds and evaluations.
- VRAM management: Automatic torch.cuda.empty_cache() after fit and evaluate to prevent
  memory fragmentation and leaks across federated rounds on hardware like RTX 4060 (8GB).
- CLI: --client_id (1, 2, 3) loads the corresponding bank_{id}_data.csv Non-IID partition.
"""

import argparse
import os
import sys
from typing import Dict, List, Optional, Tuple, Any, Union
import logging

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# Setup logger
logger = logging.getLogger("FedGuard.Client")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", "%H:%M:%S")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Flower client import with fallback mock
try:
    import flwr as fl
    from flwr.client import NumPyClient
except ImportError:
    logger.warning("Flower (flwr) not installed in local environment. Defining fallback NumPyClient.")
    class NumPyClient:
        """Fallback mock base class when flwr is not installed."""
        pass

# Safe relative/absolute imports for model and engine components
try:
    from model_scripts.model import FraudDetectionModel, get_device
except ImportError:
    try:
        from model import FraudDetectionModel, get_device
    except ImportError:
        from clients.core.model import FraudDetectionModel, get_device

try:
    from engine import train, test, TabularFraudDataset
except ImportError:
    from model_scripts.engine import train, test, TabularFraudDataset


# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_DATA_DIR      = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "splits")
DEFAULT_SERVER_ADDR   = "127.0.0.1:8080"
FEATURE_LABEL_COL     = "label"
INPUT_DIM             = 30   # V1..V30 matching FraudDetectionModel(input_dim=30)
BATCH_SIZE            = 128
TRAIN_SPLIT           = 0.8  # 80% train, 20% test


# =====================================================================
# Data Loading
# =====================================================================

def load_client_data(
    client_id: int,
    data_dir: str = DEFAULT_DATA_DIR,
    label_col: str = FEATURE_LABEL_COL,
    train_split: float = TRAIN_SPLIT,
    batch_size: int = BATCH_SIZE,
    seed: int = 42,
) -> Tuple[DataLoader, DataLoader, float]:
    """
    Load the bank_{client_id}_data.csv Non-IID partition and return
    train and test DataLoaders along with the computed pos_weight.

    Args:
        client_id:   Bank partition ID (1, 2, or 3).
        data_dir:    Directory containing the CSV files.
        label_col:   Name of the binary label column.
        train_split: Fraction of data used for training (remainder for evaluation).
        batch_size:  DataLoader batch size.
        seed:        Random seed for shuffling.

    Returns:
        (trainloader, testloader, pos_weight)
        pos_weight: n_normal / n_fraud — used by BCELoss to counter class imbalance.
    """
    csv_path = os.path.join(data_dir, f"bank_{client_id}_data.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Partition not found: {csv_path}\n"
            f"Run `python data_splitter.py` first to generate the data splits."
        )

    df = pd.read_csv(csv_path)
    logger.info(
        f"[Client {client_id}] Loaded {len(df):,} rows from {os.path.basename(csv_path)} | "
        f"fraud_rate={df[label_col].mean()*100:.2f}%"
    )

    # Separate features and labels
    y = torch.tensor(df[label_col].values, dtype=torch.float32)
    X = torch.tensor(df.drop(columns=[label_col]).values, dtype=torch.float32)

    # Shuffle and split
    torch.manual_seed(seed)
    perm = torch.randperm(len(X))
    X, y = X[perm], y[perm]

    n_train = int(len(X) * train_split)
    X_train, y_train = X[:n_train], y[:n_train]
    X_test,  y_test  = X[n_train:], y[n_train:]

    # Compute pos_weight for this bank's imbalance ratio
    n_fraud  = float(y_train.sum().item())
    n_normal = float(len(y_train) - n_fraud)
    pos_weight = n_normal / max(n_fraud, 1.0)

    logger.info(
        f"[Client {client_id}] Train={len(X_train):,} | Test={len(X_test):,} | "
        f"pos_weight={pos_weight:.1f}"
    )

    train_dataset = TabularFraudDataset(X_train, y_train)
    test_dataset  = TabularFraudDataset(X_test,  y_test)

    # drop_last=True on trainloader guards against BatchNorm1d batch-of-1 crashes
    trainloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True,  drop_last=True)
    testloader  = DataLoader(test_dataset,  batch_size=batch_size, shuffle=False)

    return trainloader, testloader, pos_weight


# =====================================================================
# Weight Serialization Helper Functions
# =====================================================================

def get_parameters(net: nn.Module) -> List[np.ndarray]:
    """
    Extracts all parameter tensors and buffers from a PyTorch model into a list of NumPy ndarrays.
    Used by Flower for federated weight aggregation (FedAvg, FedProx).

    Args:
        net (nn.Module): The local PyTorch model.

    Returns:
        List[np.ndarray]: List of layer parameters and buffers as NumPy arrays.
    """
    return [val.detach().cpu().numpy() for _, val in net.state_dict().items()]


def set_parameters(net: nn.Module, parameters: List[np.ndarray]) -> None:
    """
    Loads a list of NumPy ndarrays into the PyTorch model's state_dict in-place.
    Preserves exact tensor shapes, data types, and target device.

    Args:
        net (nn.Module): The local PyTorch model to update.
        parameters (List[np.ndarray]): Updated parameters received from the FL server.
    """
    current_state = net.state_dict()
    params_dict = zip(current_state.keys(), parameters)
    state_dict = {
        key: torch.as_tensor(
            param,
            dtype=current_state[key].dtype,
            device=current_state[key].device,
        )
        for key, param in params_dict
    }
    net.load_state_dict(state_dict, strict=True)


# =====================================================================
# Flower FL Client Implementation
# =====================================================================

class FraudFlowerClient(NumPyClient):
    """
    Federated Learning Client for credit card fraud detection.
    Inherits from flwr.client.NumPyClient to integrate with the Flower aggregation server.
    """

    def __init__(
        self,
        net: nn.Module,
        trainloader: DataLoader,
        testloader: DataLoader,
        device: Optional[Union[torch.device, str]] = None,
        pos_weight: Optional[float] = None,
        learning_rate: float = 1e-3,
        weight_decay: float = 1e-4,
        client_id: int = 0,
    ) -> None:
        """
        Args:
            net: PyTorch FraudDetectionModel instance.
            trainloader: PyTorch DataLoader for local bank training data.
            testloader: PyTorch DataLoader for local bank validation/testing data.
            device: Computing device (CUDA or CPU).
            pos_weight: Scalar multiplier for positive (fraud) instances in BCELoss.
            learning_rate: Local AdamW optimizer learning rate.
            weight_decay: L2 regularization factor.
            client_id: Bank partition ID used in logging (1, 2, or 3).
        """
        self.client_id = client_id
        self.device = torch.device(device) if device is not None else get_device()
        self.net = net.to(self.device)
        self.trainloader = trainloader
        self.testloader = testloader
        self.pos_weight = pos_weight
        self.learning_rate = learning_rate
        self.weight_decay = weight_decay

        # Local optimizer
        self.optimizer = torch.optim.AdamW(
            self.net.parameters(),
            lr=self.learning_rate,
            weight_decay=self.weight_decay,
        )

    def get_parameters(self, config: Dict[str, Any]) -> List[np.ndarray]:
        """Returns the current local model parameters."""
        return get_parameters(self.net)

    def fit(
        self, parameters: List[np.ndarray], config: Dict[str, Any]
    ) -> Tuple[List[np.ndarray], int, Dict[str, Any]]:
        """
        Executes local model training for one or more epochs using parameters sent by the server.

        Args:
            parameters: Global model parameters received from the FL server.
            config: Training configurations from the server (e.g. epochs, lr, pos_weight).

        Returns:
            Tuple containing:
            - Updated local model parameters as List[np.ndarray]
            - Number of training examples processed
            - Dictionary of training metrics (train_loss, epochs)
        """
        # 1. Synchronize local model with global server weights
        set_parameters(self.net, parameters)

        # 2. Extract dynamic configurations from server strategy config
        epochs = int(config.get("epochs", config.get("local_epochs", 1)))
        if "lr" in config:
            new_lr = float(config["lr"])
            for param_group in self.optimizer.param_groups:
                param_group["lr"] = new_lr

        pos_weight = float(config["pos_weight"]) if "pos_weight" in config else self.pos_weight

        # 3. Train locally using engine.train
        train_loss = train(
            net=self.net,
            trainloader=self.trainloader,
            optimizer=self.optimizer,
            epochs=epochs,
            device=self.device,
            pos_weight=pos_weight,
        )

        logger.info(
            f"[Client {self.client_id}] fit() | loss={train_loss:.4f} | epochs={epochs}"
        )

        # 4. Clean GPU VRAM to prevent memory accumulation across federated rounds
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        # 5. Calculate sample count
        num_examples = (
            len(self.trainloader.dataset)
            if hasattr(self.trainloader, "dataset")
            else sum(len(b[0]) for b in self.trainloader)
        )

        metrics: Dict[str, Any] = {
            "train_loss": float(train_loss),
            "epochs": epochs,
            "client_id": self.client_id,
        }

        return get_parameters(self.net), num_examples, metrics

    def evaluate(
        self, parameters: List[np.ndarray], config: Dict[str, Any]
    ) -> Tuple[float, int, Dict[str, Any]]:
        """
        Evaluates the global model parameters on the local validation dataset.

        Args:
            parameters: Global model parameters received from the FL server.
            config: Evaluation configurations from the server.

        Returns:
            Tuple containing:
            - Loss (float)
            - Number of evaluation examples (int)
            - Metrics dictionary containing accuracy, precision, recall, f1_score, and roc_auc
        """
        # 1. Update local model with global parameters
        set_parameters(self.net, parameters)

        # 2. Run local evaluation using engine.test
        eval_results = test(
            net=self.net,
            testloader=self.testloader,
            device=self.device,
        )

        # 3. Flush GPU cache to free evaluation buffers
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        loss = float(eval_results.get("Loss", 0.0))
        num_examples = (
            len(self.testloader.dataset)
            if hasattr(self.testloader, "dataset")
            else sum(len(b[0]) for b in self.testloader)
        )

        logger.info(
            f"[Client {self.client_id}] evaluate() | "
            f"loss={loss:.4f} | acc={eval_results.get('Accuracy', 0):.4f} | "
            f"f1={eval_results.get('F1-Score', 0):.4f}"
        )

        # Format metrics dictionary to ensure required keys are present
        metrics: Dict[str, Any] = {
            "loss": loss,
            "accuracy":  float(eval_results.get("Accuracy",  0.0)),
            "precision": float(eval_results.get("Precision", 0.0)),
            "recall":    float(eval_results.get("Recall",    0.0)),
            "f1_score":  float(eval_results.get("F1-Score",  0.0)),
            "roc_auc":   float(eval_results.get("ROC-AUC",   0.0)),
            # Canonical aliases for server.py weighted_average compatibility
            "F1-Score":  float(eval_results.get("F1-Score",  0.0)),
            "ROC-AUC":   float(eval_results.get("ROC-AUC",   0.0)),
            "client_id": self.client_id,
        }

        return loss, num_examples, metrics


# =====================================================================
# CLI Entry Point
# =====================================================================

def main() -> None:
    parser = argparse.ArgumentParser(
        description="FedGuard Flower Client — connect a bank node to the FL server.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--client_id",
        type=int,
        required=True,
        choices=[1, 2, 3],
        help="Bank partition ID (1, 2, or 3). Determines which bank_N_data.csv to load.",
    )
    parser.add_argument(
        "--server_address",
        type=str,
        default=DEFAULT_SERVER_ADDR,
        help="FL server gRPC address (host:port).",
    )
    parser.add_argument(
        "--data_dir",
        type=str,
        default=DEFAULT_DATA_DIR,
        help="Directory containing bank_1_data.csv, bank_2_data.csv, bank_3_data.csv.",
    )
    parser.add_argument(
        "--input_dim",
        type=int,
        default=INPUT_DIM,
        help="Number of input features expected by the model.",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=BATCH_SIZE,
        help="DataLoader batch size.",
    )

    args = parser.parse_args()

    logger.info(
        f"[Client {args.client_id}] Starting | server={args.server_address} | "
        f"data_dir={args.data_dir}"
    )

    # 1. Load bank-specific Non-IID partition
    trainloader, testloader, pos_weight = load_client_data(
        client_id=args.client_id,
        data_dir=args.data_dir,
        batch_size=args.batch_size,
    )

    # 2. Instantiate model
    device = get_device(memory_fraction=0.2, device_id=0)
    model  = FraudDetectionModel(input_dim=args.input_dim, dropout_rate=0.2).to(device)

    # 3. Wrap in FraudFlowerClient
    client = FraudFlowerClient(
        net=model,
        trainloader=trainloader,
        testloader=testloader,
        device=device,
        pos_weight=pos_weight,
        learning_rate=1e-3,
        weight_decay=1e-4,
        client_id=args.client_id,
    )

    logger.info(
        f"[Client {args.client_id}] Connecting to FL server at {args.server_address} ..."
    )

    # 4. Start Flower client
    try:
        fl.client.start_numpy_client(
            server_address=args.server_address,
            client=client,
        )
    except Exception as e:
        logger.error(f"[Client {args.client_id}] Disconnected with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
