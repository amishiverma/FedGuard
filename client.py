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
"""

from typing import Dict, List, Optional, Tuple, Any
import logging
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

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
    from engine import train, test
except ImportError:
    from model_scripts.engine import train, test


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
        """
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
        """
        Returns the current local model parameters.

        Args:
            config: Configuration dictionary sent by the FL server.

        Returns:
            List[np.ndarray]: Model parameters as NumPy arrays.
        """
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
            - Dictionary of training metrics (e.g. train_loss)
        """
        # 1. Synchronize local model with global server weights
        set_parameters(self.net, parameters)

        # 2. Extract dynamic configurations if specified by the FL server strategy
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

        # Format metrics dictionary to ensure required keys are present
        metrics: Dict[str, Any] = {
            "loss": loss,
            "accuracy": float(eval_results.get("Accuracy", 0.0)),
            "precision": float(eval_results.get("Precision", 0.0)),
            "recall": float(eval_results.get("Recall", 0.0)),
            "f1_score": float(eval_results.get("F1-Score", 0.0)),
            "roc_auc": float(eval_results.get("ROC-AUC", 0.0)),
            # Key aliases
            "F1-Score": float(eval_results.get("F1-Score", 0.0)),
            "ROC-AUC": float(eval_results.get("ROC-AUC", 0.0)),
        }

        return loss, num_examples, metrics
