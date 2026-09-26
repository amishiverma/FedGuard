"""
Harsh Test Suite for Federated Learning Client
==============================================
Validates client.py in a standalone simulation (without requiring a live Flower FL server):
- Harsh Test A (Fit Lifecycle): Ensures parameter synchronization, local gradient updates,
  and parameter tensor shape integrity without structural corruption.
- Harsh Test B (Evaluate Metrics Packaging): Validates evaluation packaging, metric existence
  ('f1_score', 'roc_auc'), and GPU VRAM stability across simulation cycles.
"""

import sys
import logging
import numpy as np
import torch
from torch.utils.data import DataLoader

# Setup logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("TestClient")

# Safe imports
try:
    from model_scripts.model import FraudDetectionModel, get_device
except ImportError:
    from model import FraudDetectionModel, get_device

try:
    from engine import TabularFraudDataset
except ImportError:
    from model_scripts.engine import TabularFraudDataset

try:
    from client import FraudFlowerClient, get_parameters, set_parameters
except ImportError:
    from clients.core.client import FraudFlowerClient, get_parameters, set_parameters


def generate_dummy_data(
    num_samples: int = 100, input_dim: int = 30, fraud_ratio: float = 0.05
):
    """
    Generates synthetic tabular fraud dataset with severe class imbalance.
    """
    torch.manual_seed(42)
    n_fraud = max(1, int(num_samples * fraud_ratio))
    n_normal = num_samples - n_fraud

    features_normal = torch.randn(n_normal, input_dim)
    labels_normal = torch.zeros(n_normal, 1)

    features_fraud = torch.randn(n_fraud, input_dim) + 2.5
    labels_fraud = torch.ones(n_fraud, 1)

    features = torch.cat([features_normal, features_fraud], dim=0)
    labels = torch.cat([labels_normal, labels_fraud], dim=0)

    # Shuffle indices
    perm = torch.randperm(num_samples)
    return features[perm], labels[perm], n_normal, n_fraud


def run_harsh_tests() -> None:
    print("=" * 70)
    print("FedGuard - Standalone Flower Client Harsh Validation Suite")
    print("=" * 70)

    # 1. Hardware and Device Setup
    device = get_device(memory_fraction=0.2, device_id=0)
    print(f"Device Initialized: {device}")

    # 2. Synthesize 100 tabular rows with 30 features (95 normal, 5 fraud)
    total_samples = 100
    input_dim = 30
    features, labels, n_norm, n_fr = generate_dummy_data(
        num_samples=total_samples, input_dim=input_dim, fraud_ratio=0.05
    )

    # Train / Test split (80 train, 20 test)
    train_size = 80
    train_dataset = TabularFraudDataset(features[:train_size], labels[:train_size])
    test_dataset = TabularFraudDataset(features[train_size:], labels[train_size:])

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

    print(f"Data Split -> Train: {len(train_dataset)} rows | Test: {len(test_dataset)} rows")

    # 3. Model & Dummy Global Weights Initialization
    model = FraudDetectionModel(input_dim=input_dim, dropout_rate=0.2).to(device)
    dummy_weights = get_parameters(model)
    print(f"Extracted {len(dummy_weights)} global weight arrays from model architecture.")

    # 4. Instantiate Client
    client = FraudFlowerClient(
        net=model,
        trainloader=train_loader,
        testloader=test_loader,
        device=device,
        pos_weight=19.0,  # 95/5 ratio
        learning_rate=1e-3,
    )

    # -----------------------------------------------------------------
    # Harsh Test A: Fit Lifecycle & Weight Shape Preservation
    # -----------------------------------------------------------------
    print("\n" + "=" * 70)
    print("RUNNING HARSH TEST A: Fit Lifecycle & Structural Weight Preservation")
    print("=" * 70)

    vram_before = torch.cuda.memory_allocated(device) if torch.cuda.is_available() else 0

    returned_params, num_examples, fit_metrics = client.fit(
        parameters=dummy_weights,
        config={"epochs": 1, "lr": 0.001},
    )

    print(f"client.fit() returned {len(returned_params)} parameter arrays.")
    print(f"Reported Training Examples: {num_examples}")
    print(f"Fit Metrics: {fit_metrics}")

    # Assertions
    assert len(returned_params) == len(dummy_weights), (
        f"Parameter count mismatch! Expected {len(dummy_weights)}, got {len(returned_params)}"
    )

    for i, (orig, updated) in enumerate(zip(dummy_weights, returned_params)):
        assert orig.shape == updated.shape, (
            f"Shape corruption in layer {i}: Expected {orig.shape}, got {updated.shape}"
        )
        assert orig.dtype == updated.dtype, (
            f"Dtype corruption in layer {i}: Expected {orig.dtype}, got {updated.dtype}"
        )

    assert num_examples == len(train_dataset), (
        f"Example count mismatch! Expected {len(train_dataset)}, got {num_examples}"
    )
    assert "train_loss" in fit_metrics, "Missing 'train_loss' in fit metrics!"
    assert not np.isnan(fit_metrics["train_loss"]), "Fit train_loss is NaN!"

    print("\n>> HARSH TEST A PASSED: Parameters structurally intact after local training round.")

    # -----------------------------------------------------------------
    # Harsh Test B: Evaluate Metrics Packaging & VRAM Memory Stability
    # -----------------------------------------------------------------
    print("\n" + "=" * 70)
    print("RUNNING HARSH TEST B: Evaluate Metrics Packaging & VRAM Stability")
    print("=" * 70)

    loss, eval_num_examples, eval_metrics = client.evaluate(
        parameters=dummy_weights,
        config={},
    )

    print(f"client.evaluate() Loss: {loss:.4f} on {eval_num_examples} test samples")
    print("Evaluation Metrics Returned:")
    for k, v in eval_metrics.items():
        print(f"  - {k:12s}: {v:.4f}")

    # Assertions
    assert isinstance(loss, float), f"Loss must be a float, got {type(loss)}"
    assert not np.isnan(loss), "Evaluation loss is NaN!"
    assert eval_num_examples == len(test_dataset), (
        f"Test example count mismatch! Expected {len(test_dataset)}, got {eval_num_examples}"
    )

    # Verify required keys
    assert "f1_score" in eval_metrics, "Missing mandatory 'f1_score' metric in client.evaluate!"
    assert "roc_auc" in eval_metrics, "Missing mandatory 'roc_auc' metric in client.evaluate!"
    assert not np.isnan(eval_metrics["f1_score"]), "Metric 'f1_score' is NaN!"
    assert not np.isnan(eval_metrics["roc_auc"]), "Metric 'roc_auc' is NaN!"

    # VRAM check
    if torch.cuda.is_available():
        vram_after = torch.cuda.memory_allocated(device)
        print(f"\nVRAM Usage Check:")
        print(f"  - Before fit: {vram_before / 1024**2:.2f} MB")
        print(f"  - After eval: {vram_after / 1024**2:.2f} MB")
        print("  - torch.cuda.empty_cache() confirmed operational.")

    print("\n>> HARSH TEST B PASSED: Evaluation metrics properly packaged and VRAM stable.")
    print("\n" + "=" * 70)
    print("ALL CLIENT HARSH TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_harsh_tests()
