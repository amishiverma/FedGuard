"""
FedGuard — clients/core/model.py
==================================
TabularNet: MLP for binary fraud / credit-default classification.

Architecture:
    input_dim -> 256 -> 128 -> 64 -> 1  (BCEWithLogitsLoss, no sigmoid)

Opacus compatibility:
    - No LSTM, BatchNorm, or other unsupported layers.
    - All layers are Opacus-safe (Linear, ReLU, Dropout).

Flower compatibility:
    - get_model_parameters / set_model_parameters use numpy arrays
      for clean weight serialisation over the Flower protocol.
"""

import numpy as np
import torch
import torch.nn as nn
from typing import List


# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------

class TabularNet(nn.Module):
    """
    MLP for binary tabular classification.

    Args:
        input_dim (int): Number of input features. Default: 104
                         (Home Credit dataset after preprocessing).
        dropout (float): Dropout probability applied after each hidden layer.

    Forward input : FloatTensor of shape (batch, input_dim)
    Forward output: FloatTensor of shape (batch, 1)  — raw logits
    Loss          : nn.BCEWithLogitsLoss  (applies sigmoid internally)
    """

    def __init__(self, input_dim: int = 104, dropout: float = 0.2):
        super().__init__()
        self.net = nn.Sequential(
            # Block 1
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            # Block 2
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            # Block 3
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            # Output — single logit for BCEWithLogitsLoss
            nn.Linear(64, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


# ---------------------------------------------------------------------------
# Flower / numpy helpers
# ---------------------------------------------------------------------------

def get_device() -> torch.device:
    """Return CUDA if available, else CPU."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_model_parameters(model: nn.Module) -> List[np.ndarray]:
    """Extract model weights as a list of numpy arrays (Flower protocol)."""
    return [val.cpu().numpy() for _, val in model.state_dict().items()]


def set_model_parameters(model: nn.Module, parameters: List[np.ndarray]) -> nn.Module:
    """Load a list of numpy arrays back into the model (Flower protocol)."""
    params_dict = zip(model.state_dict().keys(), parameters)
    state_dict  = {k: torch.tensor(v) for k, v in params_dict}
    model.load_state_dict(state_dict, strict=True)
    return model


# ---------------------------------------------------------------------------
# Re-export aliases (backward compat with clients/core/__init__ stub)
# ---------------------------------------------------------------------------
FraudDetectionModel = TabularNet


# ---------------------------------------------------------------------------
# Quick sanity check
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    device = get_device()
    model  = TabularNet(input_dim=104).to(device)
    dummy  = torch.randn(32, 104, device=device)
    out    = model(dummy)
    print(f"TabularNet output shape : {out.shape}")   # expect (32, 1)
    print(f"Parameter count         : {sum(p.numel() for p in model.parameters()):,}")
    print(f"Device                  : {device}")
    print("model.py self-test PASSED")
