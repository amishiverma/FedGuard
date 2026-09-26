"""
FedGuard — clients/core/client.py
====================================
Flower NumPyClient for a single bank node.

Each bank runs this client against its local CSV partition.
Raw data never leaves this process — only model weights are sent to server.

Usage:
    python clients/core/client.py --bank bank_a
    python clients/core/client.py --bank bank_b
    python clients/core/client.py --bank bank_c
"""

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

import argparse
import os
import sys
from typing import Dict, List, Tuple, Any

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

try:
    import flwr as fl
    from flwr.common import NDArrays, Scalar
except ImportError:
    class fl:  # type: ignore
        client = type("client", (), {"NumPyClient": object, "start_numpy_client": None})()
    NDArrays = List[np.ndarray]  # type: ignore
    Scalar = Any  # type: ignore

# ---------------------------------------------------------------------------
# Resolve monorepo imports regardless of working directory
# ---------------------------------------------------------------------------
_CORE_DIR    = os.path.dirname(os.path.abspath(__file__))   # clients/core/
_PROJECT_DIR = os.path.abspath(os.path.join(_CORE_DIR, "..", ".."))  # repo root

for _p in [_CORE_DIR, _PROJECT_DIR]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from model import TabularNet, get_device, get_model_parameters, set_model_parameters  # noqa: E402
except ImportError:
    from clients.core.model import TabularNet, get_device, get_model_parameters, set_model_parameters  # noqa: E402

try:
    from dp_training import (  # noqa: E402
        attach_dp_engine,
        train_one_epoch_dp,
        get_privacy_spent,
    )
except ImportError:
    from clients.core.dp_training import (  # noqa: E402
        attach_dp_engine,
        train_one_epoch_dp,
        get_privacy_spent,
    )

# Re-export client utilities from client.py
try:
    from client import FraudFlowerClient, get_parameters, set_parameters  # noqa: E402
except ImportError:
    FraudFlowerClient = None  # type: ignore
    get_parameters = get_model_parameters
    set_parameters = set_model_parameters

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
INPUT_DIM    = 104       # feature columns after preprocessing
BATCH_SIZE   = 128       # logical batch for DP noise calibration
LR           = 1e-3
TARGET_EPS   = 1.0       # ε budget per round (cumulative via RDP)
DP_EPOCHS    = 1         # epochs per FL round (1 round = 1 local epoch)
TARGET_COL   = "TARGET"
SPLITS_DIR   = os.path.join(_PROJECT_DIR, "data", "raw", "splits")
SERVER_ADDR  = "127.0.0.1:8080"


# ---------------------------------------------------------------------------
# Dataset loader
# ---------------------------------------------------------------------------

def load_bank_dataset(bank_id: str) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Load the pre-split CSV for this bank into PyTorch tensors.

    Args:
        bank_id: One of 'bank_a', 'bank_b', 'bank_c'.

    Returns:
        (X, y) — FloatTensors of shapes (N, 104) and (N,).
    """
    csv_path = os.path.join(SPLITS_DIR, f"{bank_id}.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Split not found: {csv_path}\n"
            f"Run `python data/non_iid_split.py` first."
        )

    df = pd.read_csv(csv_path)
    y  = torch.tensor(df[TARGET_COL].values, dtype=torch.float32)
    X  = torch.tensor(
        df.drop(columns=[TARGET_COL]).values, dtype=torch.float32
    )
    return X, y


# ---------------------------------------------------------------------------
# Flower NumPyClient
# ---------------------------------------------------------------------------

class BankFLClient(fl.client.NumPyClient):
    """
    Flower client for a single bank node.

    Responsibilities:
      - Load local data (bank-specific CSV partition).
      - Train TabularNet locally with Opacus DP-SGD.
      - Return updated weights + privacy metrics (ε, δ, loss) to server.
      - Evaluate global model on local holdout without sending data out.
    """

    def __init__(self, bank_id: str):
        self.bank_id = bank_id
        self.device  = get_device()

        print(f"[{bank_id}] Initialising client on device: {self.device}")

        # Load data
        X, y = load_bank_dataset(bank_id)
        n_samples = len(X)

        # 80/20 train/eval split (local only — never sent anywhere)
        split_idx      = int(n_samples * 0.8)
        self.X_train   = X[:split_idx]
        self.y_train   = y[:split_idx]
        self.X_eval    = X[split_idx:]
        self.y_eval    = y[split_idx:]

        print(
            f"[{bank_id}] Dataset loaded | "
            f"train={len(self.X_train):,} | eval={len(self.X_eval):,} | "
            f"fraud_rate={y.mean().item()*100:.2f}%"
        )

        # Model
        self.model = TabularNet(input_dim=INPUT_DIM).to(self.device)

        # DP state — engine is re-attached each round so epsilon accounting
        # is per-round. Cumulative tracking is the server's responsibility
        # via the audit log.
        self._dp_attached = False

    # --- Flower protocol methods ----------------------------------------

    def get_parameters(self, config: Dict[str, Scalar]) -> NDArrays:
        """Return current model weights as numpy arrays."""
        return get_model_parameters(self.model)

    def set_parameters(self, parameters: NDArrays) -> None:
        """Load server-aggregated weights into local model."""
        set_model_parameters(self.model, parameters)

    def fit(
        self,
        parameters: NDArrays,
        config: Dict[str, Scalar],
    ) -> Tuple[NDArrays, int, Dict[str, Scalar]]:
        """
        1. Load global weights from server.
        2. Build training DataLoader.
        3. Attach Opacus PrivacyEngine (fresh per round).
        4. Run one DP-SGD epoch via train_one_epoch_dp.
        5. Return updated weights + privacy metrics.

        Returns:
            (updated_parameters, num_examples, metrics_dict)
        """
        self.set_parameters(parameters)

        # Re-instantiate model for a clean Opacus wrap each round
        # (Opacus wraps are not reusable across calls)
        fresh_model = TabularNet(input_dim=INPUT_DIM).to(self.device)
        set_model_parameters(fresh_model, parameters)

        train_dataset = TensorDataset(self.X_train, self.y_train)
        train_loader  = DataLoader(
            train_dataset,
            batch_size=BATCH_SIZE,
            shuffle=True,
            drop_last=True,   # required by Opacus for uniform batch accounting
        )

        optimizer = optim.Adam(fresh_model.parameters(), lr=LR)
        criterion = nn.BCEWithLogitsLoss()

        # Attach DP engine (fresh per round)
        try:
            private_model, private_optimizer, private_loader = attach_dp_engine(
                model=fresh_model,
                optimizer=optimizer,
                data_loader=train_loader,
                target_epsilon=TARGET_EPS,
                epochs=DP_EPOCHS,
            )
        except Exception as exc:
            print(f"[{self.bank_id}] DP attach failed: {exc} — falling back to non-private training.")
            # Fallback: train without DP (should not happen in production)
            private_model    = fresh_model
            private_optimizer = optimizer
            private_loader   = train_loader

        # One DP-SGD epoch
        result = train_one_epoch_dp(
            private_model, private_optimizer, private_loader, criterion, self.device
        )

        # Sync weights back to self.model for get_parameters consistency
        set_model_parameters(self.model, get_model_parameters(private_model))

        metrics: Dict[str, Scalar] = {
            "bank_id" : self.bank_id,
            "loss"    : result["loss"],
            "epsilon" : result["epsilon"],
            "delta"   : result["delta"],
        }

        print(
            f"[{self.bank_id}] fit() done | "
            f"loss={result['loss']:.4f} | ε={result['epsilon']:.4f} | δ={result['delta']}"
        )

        return get_model_parameters(self.model), len(self.X_train), metrics

    def evaluate(
        self,
        parameters: NDArrays,
        config: Dict[str, Scalar],
    ) -> Tuple[float, int, Dict[str, Scalar]]:
        """
        Evaluate the global model on local holdout data.
        Only loss and accuracy are returned — no raw data leaves the bank.

        Returns:
            (loss, num_examples, metrics_dict)
        """
        self.set_parameters(parameters)
        self.model.eval()
        criterion = nn.BCEWithLogitsLoss()

        X_eval = self.X_eval.to(self.device)
        y_eval = self.y_eval.to(self.device).float().unsqueeze(1)

        with torch.no_grad():
            logits = self.model(X_eval)
            loss   = criterion(logits, y_eval).item()
            preds  = (torch.sigmoid(logits) > 0.5).float()
            acc    = (preds == y_eval).float().mean().item()

        print(
            f"[{self.bank_id}] evaluate() | "
            f"loss={loss:.4f} | acc={acc*100:.2f}% | n={len(X_eval)}"
        )

        return loss, len(self.X_eval), {"accuracy": acc, "bank_id": self.bank_id}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="FedGuard Flower Client")
    parser.add_argument(
        "--bank",
        type=str,
        required=True,
        choices=["bank_a", "bank_b", "bank_c"],
        help="Bank partition to use (e.g. bank_a)",
    )
    parser.add_argument(
        "--server",
        type=str,
        default=SERVER_ADDR,
        help=f"FL server address (default: {SERVER_ADDR})",
    )
    args = parser.parse_args()

    client = BankFLClient(bank_id=args.bank)

    print(f"[{args.bank}] Connecting to FL server at {args.server} ...")
    fl.client.start_numpy_client(
        server_address=args.server,
        client=client,
    )


__all__ = [
    "BankFLClient",
    "FraudFlowerClient",
    "get_parameters",
    "set_parameters",
    "get_model_parameters",
    "set_model_parameters",
    "load_bank_dataset",
    "main",
]


if __name__ == "__main__":
    main()
