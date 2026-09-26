"""
Federated Learning Fraud Detection Model
=========================================
PyTorch implementation of an MLP architecture optimized for tabular credit card fraud detection,
designed for decentralized federated learning with Flower (flwr).

Features:
- FraudDetectionModel: 4-layer MLP (30 -> 64 -> 32 -> 16 -> 1) with BatchNorm1d and Dropout(0.2)
- get_device: Device selection with per-process CUDA VRAM capping (ideal for multi-client simulation on RTX 4060)
- Flower FL serialization helpers: get_model_parameters and set_model_parameters
"""

from typing import List, Tuple, Dict, Any, Optional
import logging
import numpy as np
import torch
import torch.nn as nn

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("FedGuard.Model")


class FraudDetectionModel(nn.Module):
    """
    Multilayer Perceptron (MLP) for credit card fraud detection on tabular data.

    Architecture:
        Input Layer:        30 features (e.g., Time, V1-V28 PCA components, Amount)
        Hidden Layer 1:     64 units -> BatchNorm1d -> ReLU -> Dropout(0.2)
        Hidden Layer 2:     32 units -> BatchNorm1d -> ReLU -> Dropout(0.2)
        Hidden Layer 3:     16 units -> BatchNorm1d -> ReLU -> Dropout(0.2)
        Output Layer:       1 unit   -> Sigmoid (Binary classification: 0 = Normal, 1 = Fraud)

    Attributes:
        input_dim (int): Dimensionality of input tabular features (default: 30).
        dropout_rate (float): Dropout probability applied across hidden layers (default: 0.2).
        network (nn.Sequential): Sequential container of layers.
    """

    def __init__(self, input_dim: int = 30, dropout_rate: float = 0.2) -> None:
        super(FraudDetectionModel, self).__init__()

        self.input_dim: int = input_dim
        self.dropout_rate: float = dropout_rate

        self.network: nn.Sequential = nn.Sequential(
            # --- Hidden Layer 1: 30 -> 64 ---
            nn.Linear(in_features=self.input_dim, out_features=64, bias=False),
            nn.BatchNorm1d(num_features=64),
            nn.ReLU(),
            nn.Dropout(p=self.dropout_rate),

            # --- Hidden Layer 2: 64 -> 32 ---
            nn.Linear(in_features=64, out_features=32, bias=False),
            nn.BatchNorm1d(num_features=32),
            nn.ReLU(),
            nn.Dropout(p=self.dropout_rate),

            # --- Hidden Layer 3: 32 -> 16 ---
            nn.Linear(in_features=32, out_features=16, bias=False),
            nn.BatchNorm1d(num_features=16),
            nn.ReLU(),
            nn.Dropout(p=self.dropout_rate),

            # --- Output Layer: 16 -> 1 (Binary Probability) ---
            nn.Linear(in_features=16, out_features=1, bias=True),
            nn.Sigmoid(),
        )

        self._initialize_weights()

    def _initialize_weights(self) -> None:
        """
        Kaiming/He initialization for Linear layers followed by ReLU activation,
        and standard initialization for Batch Normalization.
        """
        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.kaiming_normal_(module.weight, mode="fan_in", nonlinearity="relu")
                if module.bias is not None:
                    nn.init.constant_(module.bias, 0.0)
            elif isinstance(module, nn.BatchNorm1d):
                nn.init.constant_(module.weight, 1.0)
                nn.init.constant_(module.bias, 0.0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass producing fraud probability scores.

        Args:
            x (torch.Tensor): Input batch of tabular features with shape (batch_size, input_dim).

        Returns:
            torch.Tensor: Predicted probabilities in range [0, 1] with shape (batch_size, 1).
        """
        return self.network(x)

    def get_logits(self, x: torch.Tensor) -> torch.Tensor:
        """
        Extract raw unactivated logits before Sigmoid (useful for BCEWithLogitsLoss / Differential Privacy).

        Args:
            x (torch.Tensor): Input batch of tabular features with shape (batch_size, input_dim).

        Returns:
            torch.Tensor: Unactivated linear logits with shape (batch_size, 1).
        """
        # Pass through all layers except the trailing nn.Sigmoid()
        feat = x
        for layer in list(self.network.children())[:-1]:
            feat = layer(feat)
        return feat


def get_device(memory_fraction: float = 0.2, device_id: int = 0) -> torch.device:
    """
    Detects hardware availability and initializes the execution device.
    If NVIDIA CUDA is available, restricts PyTorch VRAM allocation to a specified fraction
    per process. This prevents CUDA Out-Of-Memory (OOM) errors when concurrently simulating
    multiple federated client nodes on a single GPU (e.g., NVIDIA GeForce RTX 4060 8GB VRAM).

    Args:
        memory_fraction (float): Target fraction of total GPU memory per process (e.g., 0.2 = 20%).
                                 Default is 0.2 (allowing up to ~4-5 concurrent bank client processes).
        device_id (int): Zero-indexed CUDA device ID (default: 0).

    Returns:
        torch.device: The resolved device ('cuda:0' or 'cpu').
    """
    if torch.cuda.is_available():
        device: torch.device = torch.device(f"cuda:{device_id}")
        gpu_name: str = torch.cuda.get_device_name(device_id)
        total_vram_gb: float = torch.cuda.get_device_properties(device_id).total_memory / (1024 ** 3)

        try:
            # Restrict PyTorch's memory allocator to avoid exhausting VRAM during multi-client FL runs
            torch.cuda.set_per_process_memory_fraction(memory_fraction, device=device_id)
            allocated_limit_gb: float = total_vram_gb * memory_fraction
            logger.info(
                f"[CUDA] Assigned {device} ({gpu_name}). "
                f"VRAM limited to {memory_fraction:.0%} ({allocated_limit_gb:.2f} GB of {total_vram_gb:.2f} GB) "
                f"for federated client isolation."
            )
        except RuntimeError as e:
            logger.warning(
                f"[CUDA] Could not set per-process memory fraction on {device}: {e}. "
                "Ensure memory fraction is configured before any CUDA allocations."
            )
        return device
    else:
        logger.info("[CPU] CUDA acceleration not detected. Falling back to CPU.")
        return torch.device("cpu")


# =====================================================================
# Flower (flwr) Federated Learning Serialization Helpers
# =====================================================================

def get_model_parameters(model: nn.Module) -> List[np.ndarray]:
    """
    Extracts trainable weights from a PyTorch model into a list of NumPy arrays.
    Required by Flower (flwr) NumPyClient.get_parameters().

    Args:
        model (nn.Module): PyTorch fraud detection model.

    Returns:
        List[np.ndarray]: List of model parameters as NumPy ndarrays.
    """
    return [val.cpu().numpy() for _, val in model.state_dict().items()]


def set_model_parameters(model: nn.Module, parameters: List[np.ndarray]) -> None:
    """
    Updates PyTorch model weights in-place from a list of NumPy arrays received from
    the Flower aggregation server (FedAvg / FedProx).
    Required by Flower (flwr) NumPyClient.set_parameters() / fit() / evaluate().

    Args:
        model (nn.Module): PyTorch fraud detection model.
        parameters (List[np.ndarray]): Updated global parameters from Flower FL server.
    """
    params_dict = zip(model.state_dict().keys(), parameters)
    state_dict = {
        key: torch.tensor(param, dtype=model.state_dict()[key].dtype)
        for key, param in params_dict
    }
    model.load_state_dict(state_dict, strict=True)


if __name__ == "__main__":
    print("=" * 70)
    print("FedGuard - PyTorch Fraud Detection Model Architecture Verification")
    print("=" * 70)

    # 1. Initialize Device with RTX 4060 multi-client memory capping (20% VRAM)
    device = get_device(memory_fraction=0.2, device_id=0)

    # 2. Instantiate Model
    model = FraudDetectionModel(input_dim=30, dropout_rate=0.2).to(device)
    print(f"\nModel Summary:\n{model}\n")

    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total Parameters:      {total_params:,}")
    print(f"Trainable Parameters:  {trainable_params:,}")

    # 3. Test Forward Pass with synthetic batch (Batch size = 16, 30 features)
    batch_size = 16
    synthetic_inputs = torch.randn(batch_size, 30, device=device)
    model.eval()
    with torch.no_grad():
        probabilities = model(synthetic_inputs)
        logits = model.get_logits(synthetic_inputs)

    print(f"\nInput Tensor Shape:        {tuple(synthetic_inputs.shape)}")
    print(f"Output Probabilities Shape: {tuple(probabilities.shape)}")
    print(f"Sample Probabilities (first 5):\n{probabilities[:5].cpu().numpy().flatten()}")
    assert probabilities.shape == (batch_size, 1), f"Unexpected shape: {probabilities.shape}"
    assert (probabilities >= 0.0).all() and (probabilities <= 1.0).all(), "Probabilities outside [0, 1]!"

    # 4. Test Flower (flwr) Parameter Extraction and Loading
    weights = get_model_parameters(model)
    print(f"\nExtracted {len(weights)} weight tensors for Flower FL transmission.")
    set_model_parameters(model, weights)
    print("Successfully re-loaded weights via set_model_parameters(). Verification complete!")
    print("=" * 70)
