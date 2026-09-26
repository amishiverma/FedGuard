"""
Harsh Test Suite for Federated Learning Server
==============================================
Validates server.py offline without binding networking ports:
- Harsh Test A (Metric Aggregation Crash Test): Validates weighted_average against
  zero-example clients, NaN metric values, and potential division-by-zero crashes.
- Harsh Test B (Strategy Configuration): Asserts strict FedProx configuration
  (proximal_mu=0.1, min_available_clients=3) for FinTech consortium compliance.
"""

import math
import sys
import logging
from typing import Dict, List, Tuple, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("TestServer")

# Safe imports
try:
    from server import weighted_average, strategy
except ImportError:
    from backend.fl_server.server import weighted_average, strategy


def run_harsh_test_a() -> None:
    """
    Harsh Test A: Metric Aggregation Crash Test
    Tests weighted_average against extreme real-world edge cases:
    - Client 1: 1000 examples, healthy metrics.
    - Client 2: 10 examples, corrupt/NaN metrics (e.g. division by zero in client precision).
    - Client 3: 0 examples (e.g. client dropped all samples or data corruption).
    """
    print("\n" + "=" * 70)
    print("RUNNING HARSH TEST A: Metric Aggregation Crash Test (NaNs & 0-Examples)")
    print("=" * 70)

    # 1. Harsh dummy client metrics list
    harsh_client_metrics: List[Tuple[int, Dict[str, Any]]] = [
        # Client 1: Large bank, normal metrics
        (
            1000,
            {
                "accuracy": 0.960,
                "precision": 0.900,
                "recall": 0.850,
                "f1_score": 0.874,
                "roc_auc": 0.940,
            },
        ),
        # Client 2: Small bank, corrupt/NaN precision & f1_score (e.g. zero fraud predicted)
        (
            10,
            {
                "accuracy": 0.700,
                "precision": float("nan"),
                "recall": 0.400,
                "f1_score": float("nan"),
                "roc_auc": 0.650,
            },
        ),
        # Client 3: Empty dataset edge case (0 examples), but reporting nominal metrics
        (
            0,
            {
                "accuracy": 0.999,
                "precision": 0.999,
                "recall": 0.999,
                "f1_score": 0.999,
                "roc_auc": 0.999,
            },
        ),
    ]

    print("[Step 1] Executing weighted_average() with corrupted metrics input...")
    try:
        aggregated = weighted_average(harsh_client_metrics)
        print("Aggregated Output Metrics:")
        for metric, val in aggregated.items():
            print(f"  - {metric:12s}: {val:.4f}")
    except ZeroDivisionError as zde:
        print(f"CRITICAL FAILURE: ZeroDivisionError encountered: {zde}")
        sys.exit(1)
    except Exception as e:
        print(f"CRITICAL FAILURE: Unexpected exception in weighted_average: {e}")
        raise e

    # 2. Assertions on returned metrics
    expected_keys = ["accuracy", "precision", "recall", "f1_score", "roc_auc"]
    for key in expected_keys:
        assert key in aggregated, f"Missing required metric '{key}' in aggregated result!"
        val = aggregated[key]
        assert isinstance(val, (int, float)), f"Metric '{key}' must be numeric, got {type(val)}"
        assert not math.isnan(val), f"Metric '{key}' contains NaN! Corrupted values leaked into aggregation."
        assert not math.isinf(val), f"Metric '{key}' contains Inf!"

    # 3. Precision verification: Client 2's NaN should be skipped, and Client 3 (0 ex) ignored
    # Precision should strictly equal Client 1's precision (0.900)
    assert abs(aggregated["precision"] - 0.900) < 1e-4, (
        f"Precision calculation error! Expected 0.900, got {aggregated['precision']}"
    )

    # 4. Accuracy verification: Client 1 (1000 ex * 0.96) + Client 2 (10 ex * 0.70) = 960 + 7 = 967 / 1010
    expected_acc = (1000 * 0.960 + 10 * 0.700) / 1010
    assert abs(aggregated["accuracy"] - expected_acc) < 1e-4, (
        f"Accuracy calculation error! Expected {expected_acc:.5f}, got {aggregated['accuracy']:.5f}"
    )

    # 5. Extreme Boundary Sub-tests: Empty list and all-zero clients
    print("\n[Step 2] Testing complete zero-example edge cases...")
    empty_result = weighted_average([])
    assert all(v == 0.0 for v in empty_result.values()), "Empty input did not return 0.0 metrics!"

    all_zero_ex = weighted_average([(0, {"accuracy": 0.95}), (0, {"accuracy": 0.85})])
    assert all(v == 0.0 for v in all_zero_ex.values()), "All-zero examples did not return 0.0 metrics!"

    print("\n>> HARSH TEST A PASSED: All division-by-zero, NaNs, and 0-sample edge cases handled safely.")


def run_harsh_test_b() -> None:
    """
    Harsh Test B: Strategy Configuration Validation
    Inspects the initialized Flower strategy to guarantee strict compliance
    with FinTech federated requirements before starting a live cluster.
    """
    print("\n" + "=" * 70)
    print("RUNNING HARSH TEST B: FedProx Strategy FinTech Configuration")
    print("=" * 70)

    print(f"Inspecting Strategy: {type(strategy).__name__}")

    # 1. Assert proximal_mu == 0.1
    assert hasattr(strategy, "proximal_mu"), "Strategy missing 'proximal_mu' attribute!"
    print(f"  - proximal_mu:           {strategy.proximal_mu} (Expected: 0.1)")
    assert abs(strategy.proximal_mu - 0.1) < 1e-6, (
        f"Strict configuration violation: proximal_mu is {strategy.proximal_mu}, expected 0.1"
    )

    # 2. Assert min_available_clients == 3
    assert hasattr(strategy, "min_available_clients"), "Strategy missing 'min_available_clients' attribute!"
    print(f"  - min_available_clients: {strategy.min_available_clients} (Expected: 3)")
    assert strategy.min_available_clients == 3, (
        f"Strict configuration violation: min_available_clients is {strategy.min_available_clients}, expected 3"
    )

    # 3. Assert participation fractions and thresholds
    print(f"  - min_fit_clients:       {strategy.min_fit_clients} (Expected: 3)")
    assert strategy.min_fit_clients == 3, "min_fit_clients must be 3"

    print(f"  - min_evaluate_clients:  {strategy.min_evaluate_clients} (Expected: 3)")
    assert strategy.min_evaluate_clients == 3, "min_evaluate_clients must be 3"

    print(f"  - fraction_fit:          {strategy.fraction_fit} (Expected: 1.0)")
    assert strategy.fraction_fit == 1.0, "fraction_fit must be 1.0"

    print(f"  - fraction_evaluate:     {strategy.fraction_evaluate} (Expected: 1.0)")
    assert strategy.fraction_evaluate == 1.0, "fraction_evaluate must be 1.0"

    # 4. Assert evaluate_metrics_aggregation_fn is hooked up
    assert strategy.evaluate_metrics_aggregation_fn is not None, (
        "evaluate_metrics_aggregation_fn was not configured on the strategy!"
    )
    print("  - evaluate_metrics_aggregation_fn: Hooked successfully to weighted_average")

    print("\n>> HARSH TEST B PASSED: FedProx strategy strictly configured for 3-bank consortium.")


def main() -> None:
    print("=" * 70)
    print("FedGuard - Flower Server Harsh Validation Suite")
    print("=" * 70)

    # Execute Harsh Test A
    run_harsh_test_a()

    # Execute Harsh Test B
    run_harsh_test_b()

    print("\n" + "=" * 70)
    print("ALL SERVER HARSH TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
