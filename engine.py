"""
Federated Learning Training & Evaluation Engine
================================================
Production-grade PyTorch Dataset, Training, and Evaluation pipeline
tailored for tabular credit card fraud detection under extreme class imbalance.

Components:
- TabularFraudDataset: Torch Dataset wrapping tabular features and binary targets.
- train: Training loop with weighted BCELoss and BatchNorm1d single-batch guard.
- test: Evaluation loop calculating Loss, Accuracy, Precision, Recall, F1, and ROC-AUC
        with zero_division protection against imbalance crashes.
"""

from typing import Dict, Optional, Tuple, Union, Any
import logging
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)

# Configure logging
logger = logging.getLogger("FedGuard.Engine")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", "%H:%M:%S")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class TabularFraudDataset(Dataset):
    """
    PyTorch Dataset representing tabular credit card transactions.

    Accepts features and labels as PyTorch Tensors, NumPy ndarrays, or Pandas DataFrames/Series.
    Ensures features are cast to torch.float32 and labels are reshaped to (N, 1).
    """

    def __init__(
        self,
        features: Union[torch.Tensor, np.ndarray, Any],
        labels: Optional[Union[torch.Tensor, np.ndarray, Any]] = None,
    ) -> None:
        """
        Args:
            features: Input tabular features matrix of shape (N, D).
            labels: Optional binary target vector of shape (N,) or (N, 1).
        """
        # Convert features to torch.Tensor
        if isinstance(features, torch.Tensor):
            self.features: torch.Tensor = features.to(dtype=torch.float32)
        elif isinstance(features, np.ndarray):
            self.features = torch.from_numpy(features).to(dtype=torch.float32)
        elif hasattr(features, "values"):  # Handles pandas DataFrame
            self.features = torch.from_numpy(features.values).to(dtype=torch.float32)
        else:
            self.features = torch.tensor(features, dtype=torch.float32)

        # Convert labels if provided
        if labels is not None:
            if isinstance(labels, torch.Tensor):
                self.labels: Optional[torch.Tensor] = labels.to(dtype=torch.float32).view(-1, 1)
            elif isinstance(labels, np.ndarray):
                self.labels = torch.from_numpy(labels).to(dtype=torch.float32).view(-1, 1)
            elif hasattr(labels, "values"):  # Handles pandas Series
                self.labels = torch.from_numpy(labels.values).to(dtype=torch.float32).view(-1, 1)
            else:
                self.labels = torch.tensor(labels, dtype=torch.float32).view(-1, 1)

            if len(self.features) != len(self.labels):
                raise ValueError(
                    f"Features length ({len(self.features)}) does not match labels length ({len(self.labels)})."
                )
        else:
            self.labels = None

    def __len__(self) -> int:
        return len(self.features)

    def __getitem__(self, idx: int) -> Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]]:
        if self.labels is not None:
            return self.features[idx], self.labels[idx]
        return self.features[idx]


def train(
    net: nn.Module,
    trainloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    epochs: int = 1,
    device: Optional[Union[torch.device, str]] = None,
    pos_weight: Optional[float] = None,
) -> float:
    """
    Trains the FraudDetectionModel on local tabular data.

    Features:
    - Uses weighted BCELoss for severe positive-class (fraud) imbalance.
    - Explicitly guards against batches of size 1 to prevent PyTorch BatchNorm1d crashes.
    
    Args:
        net: PyTorch model (FraudDetectionModel) with Sigmoid output.
        trainloader: PyTorch DataLoader providing training batches.
        optimizer: PyTorch optimizer (e.g., AdamW, SGD).
        epochs: Number of training epochs (default: 1 for standard federated rounds).
        device: Hardware device to train on. If None, will infer from model parameters or cpu.
        pos_weight: Weight scalar assigned to positive (fraud) instances to counteract imbalance.
                    If None or 1.0, standard unweighted BCELoss is computed.

    Returns:
        float: Average training loss across the epochs.
    """
    if device is None:
        device = next(net.parameters()).device if list(net.parameters()) else torch.device("cpu")
    else:
        device = torch.device(device)

    net.to(device)
    net.train()

    total_loss: float = 0.0
    total_batches: int = 0

    # Pre-allocate pos_weight tensor on device if provided
    pos_weight_tensor: Optional[torch.Tensor] = None
    if pos_weight is not None and pos_weight > 0:
        pos_weight_tensor = torch.as_tensor(pos_weight, dtype=torch.float32, device=device)

    for epoch in range(epochs):
        epoch_loss: float = 0.0
        epoch_batches: int = 0

        for batch_idx, batch in enumerate(trainloader):
            if isinstance(batch, (list, tuple)):
                inputs, targets = batch[0], batch[1]
            else:
                raise ValueError("DataLoader must yield (features, labels) tuples for training.")

            # CRUCIAL: BatchNorm1d crashes with ValueError if batch size is 1 during training.
            if inputs.size(0) <= 1:
                logger.warning(
                    f"[BatchNorm Guard] Dropped batch #{batch_idx} of size {inputs.size(0)} "
                    "to prevent BatchNorm1d running statistics failure."
                )
                continue

            inputs = inputs.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)

            optimizer.zero_grad()

            preds = net(inputs)

            # Apply pos_weight to handle extreme fraud imbalance with BCELoss
            if pos_weight_tensor is not None:
                # Element-wise weighting: pos_weight for class 1, 1.0 for class 0
                sample_weights = torch.where(
                    targets == 1.0,
                    pos_weight_tensor,
                    torch.ones_like(targets, device=device),
                )
                loss = nn.functional.binary_cross_entropy(preds, targets, weight=sample_weights)
            else:
                loss = nn.functional.binary_cross_entropy(preds, targets)

            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            epoch_batches += 1

        if epoch_batches > 0:
            total_loss += (epoch_loss / epoch_batches)
            total_batches += 1

    avg_loss = total_loss / max(total_batches, 1)
    return avg_loss


def test(
    net: nn.Module,
    testloader: DataLoader,
    device: Optional[Union[torch.device, str]] = None,
) -> Dict[str, float]:
    """
    Evaluates the FraudDetectionModel on local validation/test data.

    Computes:
    - Loss: Binary Cross-Entropy Loss
    - Accuracy: Overall classification accuracy
    - Precision: Fraud detection precision (zero_division=0)
    - Recall: Fraud detection recall / sensitivity (zero_division=0)
    - F1-Score: Harmonic mean of precision & recall (zero_division=0)
    - ROC-AUC: Area under the ROC curve (handles single-class edge cases gracefully)

    Args:
        net: PyTorch model (FraudDetectionModel) with Sigmoid output.
        testloader: PyTorch DataLoader providing test/validation batches.
        device: Hardware device to evaluate on. If None, infers from model parameters.

    Returns:
        Dict[str, float]: Dictionary mapping metric names to their floating-point values.
    """
    if device is None:
        device = next(net.parameters()).device if list(net.parameters()) else torch.device("cpu")
    else:
        device = torch.device(device)

    net.to(device)
    net.eval()

    total_loss: float = 0.0
    total_batches: int = 0
    y_preds_list = []
    y_trues_list = []

    with torch.no_grad():
        for batch in testloader:
            if isinstance(batch, (list, tuple)):
                inputs, targets = batch[0], batch[1]
            else:
                raise ValueError("DataLoader must yield (features, labels) tuples for testing.")

            inputs = inputs.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)

            preds = net(inputs)
            loss = nn.functional.binary_cross_entropy(preds, targets)

            total_loss += loss.item()
            total_batches += 1

            y_preds_list.append(preds.detach().cpu().numpy())
            y_trues_list.append(targets.detach().cpu().numpy())

    if total_batches == 0 or len(y_preds_list) == 0:
        logger.warning("[Test Warning] Test DataLoader was empty. Returning zero metrics.")
        return {
            "Loss": 0.0,
            "Accuracy": 0.0,
            "Precision": 0.0,
            "Recall": 0.0,
            "F1-Score": 0.0,
            "ROC-AUC": 0.0,
        }

    # Aggregate predictions and ground truth across all batches
    y_pred_probs = np.vstack(y_preds_list).flatten()
    y_true = np.vstack(y_trues_list).flatten()

    # Discretize probability scores for binary classification metrics (threshold = 0.5)
    y_pred_binary = (y_pred_probs >= 0.5).astype(int)
    y_true_binary = y_true.astype(int)

    avg_loss = float(total_loss / total_batches)
    acc = float(accuracy_score(y_true_binary, y_pred_binary))
    prec = float(precision_score(y_true_binary, y_pred_binary, zero_division=0))
    rec = float(recall_score(y_true_binary, y_pred_binary, zero_division=0))
    f1 = float(f1_score(y_true_binary, y_pred_binary, zero_division=0))

    # ROC-AUC calculation with defensive fallback for single-class subsets
    try:
        if len(np.unique(y_true_binary)) > 1:
            roc_auc = float(roc_auc_score(y_true, y_pred_probs))
        else:
            # Undefined when only one class is present in the ground truth
            roc_auc = 0.0
    except Exception as e:
        logger.debug(f"ROC-AUC calculation skipped due to class distribution: {e}")
        roc_auc = 0.0

    return {
        "Loss": avg_loss,
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1-Score": f1,
        "ROC-AUC": roc_auc,
    }
