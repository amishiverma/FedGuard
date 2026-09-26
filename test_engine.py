"""
Harsh Test Suite for Federated Learning Engine
==============================================
Validates engine.py against edge cases encountered in real-world credit card fraud FL setups:
- Harsh Test A: Extreme class imbalance (999 normal vs 1 fraud) testing zero-division safety and pos_weight scaling.
- Harsh Test B: BatchNorm1d single-sample batch crash test (33 rows with batch_size=32 -> final batch of 1).
"""

import sys
import logging
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Setup logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("TestEngine")

# Flexible imports supporting both module and direct directory execution
try:
    from model_scripts.model import FraudDetectionModel, get_device
except ImportError:
    from model import FraudDetectionModel, get_device

try:
    from engine import TabularFraudDataset, train, test
except ImportError:
    from model_scripts.engine import TabularFraudDataset, train, test


def run_harsh_test_a(device: torch.device) -> None:
    """
    Harsh Test A: Extreme Imbalance & NaN Avoidance
    - 999 normal transactions (0), exactly 1 fraud transaction (1).
    - Runs test() on an untrained model (verifies zero_division=0 prevention of metric crashes).
    - Runs train() for 1 epoch with pos_weight=999.0 to handle the 1000:1 ratio.
    - Ensures no NaN, Inf, or ZeroDivisionError crashes occur.
    """
    print("\n" + "=" * 70)
    print("RUNNING HARSH TEST A: Extreme Class Imbalance (999 Normal : 1 Fraud)")
    print("=" * 70)

    # 1. Synthesize extreme 99.9% / 0.1% imbalanced dataset
    torch.manual_seed(42)
    n_normal = 999
    n_fraud = 1
    input_dim = 30

    features_normal = torch.randn(n_normal, input_dim)
    labels_normal = torch.zeros(n_normal, 1)

    features_fraud = torch.randn(n_fraud, input_dim) + 2.0  # Slightly distinct distribution
    labels_fraud = torch.ones(n_fraud, 1)

    all_features = torch.cat([features_normal, features_fraud], dim=0)
    all_labels = torch.cat([labels_normal, labels_fraud], dim=0)

    dataset = TabularFraudDataset(features=all_features, labels=all_labels)
    loader = DataLoader(dataset, batch_size=64, shuffle=True)

    print(f"Total samples: {len(dataset)} | Normal: {n_normal} | Fraud: {n_fraud}")

    # 2. Initialize Model
    model = FraudDetectionModel(input_dim=input_dim, dropout_rate=0.2).to(device)

    # 3. Evaluate Untrained Model (often predicts all 0s, triggering precision/recall zero divisions)
    print("\n[Step 1] Evaluating untrained model on 99.9% imbalanced data...")
    metrics_before = test(model, loader, device=device)

    print("Untrained Evaluation Metrics:")
    for metric_name, val in metrics_before.items():
        print(f"  - {metric_name:12s}: {val:.4f}")
        assert not (val != val), f"Metric {metric_name} returned NaN!"  # NaN check

    # 4. Train 1 Epoch with pos_weight = 999.0 to counter the extreme ratio
    print("\n[Step 2] Training for 1 epoch with pos_weight=999.0...")
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    loss = train(
        net=model,
        trainloader=loader,
        optimizer=optimizer,
        epochs=1,
        device=device,
        pos_weight=float(n_normal / n_fraud),
    )

    print(f"Training completed successfully. Average Loss: {loss:.4f}")
    assert not (loss != loss), "Training loss returned NaN!"

    # 5. Evaluate post-training
    metrics_after = test(model, loader, device=device)
    print("\nPost-Training Metrics:")
    for metric_name, val in metrics_after.items():
        print(f"  - {metric_name:12s}: {val:.4f}")
        assert not (val != val), f"Metric {metric_name} returned NaN!"

    print("\n>> HARSH TEST A PASSED: Zero-division handled cleanly, no NaNs encountered.")


def run_harsh_test_b(device: torch.device) -> None:
    """
    Harsh Test B: The BatchNorm Crash Test
    - Exactly 33 rows with batch_size=32.
    - Forces the second batch to contain exactly 1 row.
    - Standard PyTorch BatchNorm1d crashes during training when batch_size == 1:
      ValueError: Expected more than 1 value per channel when training, got input size torch.Size([1, 64])
    - engine.py must catch and drop or handle the single-sample batch seamlessly.
    """
    print("\n" + "=" * 70)
    print("RUNNING HARSH TEST B: The BatchNorm Crash Test (33 Rows, Batch Size 32)")
    print("=" * 70)

    torch.manual_seed(1337)
    total_rows = 33
    batch_size = 32
    input_dim = 30

    features_33 = torch.randn(total_rows, input_dim)
    labels_33 = torch.randint(0, 2, (total_rows, 1), dtype=torch.float32)

    dataset = TabularFraudDataset(features=features_33, labels=labels_33)
    # Notice: drop_last is intentionally False to trigger the single-sample trailing batch
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    print(f"Total Rows: {total_rows} | Batch Size: {batch_size}")
    print(f"Batch 1 size: {min(batch_size, total_rows)}")
    print(f"Batch 2 size: {total_rows - batch_size} (The dangerous batch size of 1!)")

    model = FraudDetectionModel(input_dim=input_dim, dropout_rate=0.2).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)

    print("\nExecuting train() on DataLoader containing a batch of size 1...")
    try:
        avg_loss = train(
            net=model,
            trainloader=loader,
            optimizer=optimizer,
            epochs=1,
            device=device,
            pos_weight=1.0,
        )
        print(f"Train execution completed safely without crash! Average Loss: {avg_loss:.4f}")
        print("\n>> HARSH TEST B PASSED: BatchNorm batch-of-1 crash avoided successfully.")
    except ValueError as ve:
        if "Expected more than 1 value per channel when training" in str(ve):
            print(f"\nCRITICAL FAILURE: BatchNorm crashed on batch of size 1:\n{ve}")
            sys.exit(1)
        else:
            raise ve


def main() -> None:
    print("=" * 70)
    print("FedGuard - Engine Harsh Validation Suite")
    print("=" * 70)

    device = get_device(memory_fraction=0.2, device_id=0)
    print(f"Active Device: {device}")

    # Run Harsh Test A
    run_harsh_test_a(device)

    # Run Harsh Test B
    run_harsh_test_b(device)

    print("\n" + "=" * 70)
    print("ALL HARSH ENGINE TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
