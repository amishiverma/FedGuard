"""
Federated Learning Server for Credit Card Fraud Detection
==========================================================
Implements the Flower (flwr) aggregation server with a customized FedProx strategy
optimized for non-IID tabular credit card fraud data across multiple banking nodes.

Features:
- weighted_average: Robust metric aggregation across clients handling 0-example clients
  and NaN values without division-by-zero crashes.
- FedProx Strategy: Configured with proximal_mu=0.1 to limit local drift on non-IID splits,
  with min_available_clients=3 enforcing full consortium participation.
- main: Starts the Flower gRPC server on 0.0.0.0:8080.
"""

from typing import Dict, List, Tuple, Any, Optional
import math
import logging

try:
    import numpy as np
except ImportError:
    np = None

# Configure logging
logger = logging.getLogger("FedGuard.Server")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", "%H:%M:%S")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Flower imports with defensive fallback mock
try:
    import flwr as fl
    from flwr.server.strategy import FedProx
    from flwr.server import ServerConfig
except ImportError:
    logger.warning("Flower (flwr) not installed in local environment. Providing mock classes.")

    class FedProx:  # type: ignore
        """Mock FedProx strategy for offline validation when flwr is not installed."""
        def __init__(
            self,
            fraction_fit: float = 1.0,
            fraction_evaluate: float = 1.0,
            min_fit_clients: int = 3,
            min_evaluate_clients: int = 3,
            min_available_clients: int = 3,
            proximal_mu: float = 0.1,
            evaluate_metrics_aggregation_fn: Optional[Any] = None,
            **kwargs: Any,
        ) -> None:
            self.fraction_fit = fraction_fit
            self.fraction_evaluate = fraction_evaluate
            self.min_fit_clients = min_fit_clients
            self.min_evaluate_clients = min_evaluate_clients
            self.min_available_clients = min_available_clients
            self.proximal_mu = proximal_mu
            self.evaluate_metrics_aggregation_fn = evaluate_metrics_aggregation_fn

    class ServerConfig:  # type: ignore
        """Mock ServerConfig for offline validation."""
        def __init__(self, num_rounds: int = 3) -> None:
            self.num_rounds = num_rounds

    class fl:  # type: ignore
        server = type("server", (), {"ServerConfig": ServerConfig, "start_server": None})()


# =====================================================================
# Metric Aggregation Function
# =====================================================================

TARGET_METRIC_KEYS = ["accuracy", "precision", "recall", "f1_score", "roc_auc"]

# Map aliases in case client reports PascalCase / hyphenated keys
METRIC_ALIASES = {
    "accuracy": ["accuracy", "Accuracy", "acc"],
    "precision": ["precision", "Precision"],
    "recall": ["recall", "Recall"],
    "f1_score": ["f1_score", "F1-Score", "f1", "F1"],
    "roc_auc": ["roc_auc", "ROC-AUC", "auc", "AUC"],
}


def weighted_average(metrics: List[Tuple[int, Dict[str, Any]]]) -> Dict[str, float]:
    """
    Computes the sample-weighted average of evaluation metrics across all participating clients.

    Harsh Edge Case Protections:
    - 0-example clients (e.g. filtered out datasets): Safely ignored.
    - NaN/Inf values (e.g. undefined precision when no positive instances predicted):
      Excluded from the specific metric's weighted sum and denominator, preventing NaN contamination.
    - Zero total examples or empty client list: Returns 0.0 for all metrics instead of ZeroDivisionError.

    Args:
        metrics: List of tuples (num_examples, metrics_dict) sent by clients during evaluate().

    Returns:
        Dict[str, float]: Dictionary containing aggregated 'accuracy', 'precision', 'recall',
                          'f1_score', and 'roc_auc'.
    """
    metric_weighted_sums = {k: 0.0 for k in TARGET_METRIC_KEYS}
    metric_weight_denominators = {k: 0 for k in TARGET_METRIC_KEYS}

    for num_examples, client_metrics in metrics:
        # Ignore clients that contributed no examples
        if num_examples <= 0:
            continue

        for key in TARGET_METRIC_KEYS:
            # Resolve value by checking canonical key and aliases
            val = None
            for alias in METRIC_ALIASES.get(key, [key]):
                if alias in client_metrics:
                    val = client_metrics[alias]
                    break

            # Skip if value is missing, None, NaN, or Inf
            if val is None:
                continue

            try:
                float_val = float(val)
                if math.isnan(float_val) or math.isinf(float_val):
                    continue
                # Add to weighted sum
                metric_weighted_sums[key] += float_val * num_examples
                metric_weight_denominators[key] += num_examples
            except (ValueError, TypeError):
                continue

    # Compute final weighted average for each metric
    aggregated: Dict[str, float] = {}
    for key in TARGET_METRIC_KEYS:
        denom = metric_weight_denominators[key]
        if denom > 0:
            aggregated[key] = float(metric_weighted_sums[key] / denom)
        else:
            aggregated[key] = 0.0

    return aggregated


# =====================================================================
# Flower FedProx Strategy Initialization
# =====================================================================

def init_fedprox_strategy(
    fraction_fit: float = 1.0,
    fraction_evaluate: float = 1.0,
    min_fit_clients: int = 3,
    min_evaluate_clients: int = 3,
    min_available_clients: int = 3,
    proximal_mu: float = 0.1,
) -> FedProx:
    """
    Instantiates and configures the FedProx strategy.
    
    FedProx adds a proximal term (mu * ||w - w^t||^2) to local objective functions,
    making federated optimization robust against statistical heterogeneity (Non-IID bank splits).
    """
    return FedProx(
        fraction_fit=fraction_fit,
        fraction_evaluate=fraction_evaluate,
        min_fit_clients=min_fit_clients,
        min_evaluate_clients=min_evaluate_clients,
        min_available_clients=min_available_clients,
        proximal_mu=proximal_mu,
        evaluate_metrics_aggregation_fn=weighted_average,
    )


# Default strategy instance configured per FinTech consortium requirements
strategy: FedProx = init_fedprox_strategy(
    fraction_fit=1.0,
    fraction_evaluate=1.0,
    min_fit_clients=3,
    min_evaluate_clients=3,
    min_available_clients=3,
    proximal_mu=0.1,
)


# =====================================================================
# Server Main Entrypoint
# =====================================================================

def main(
    server_address: str = "0.0.0.0:8080",
    num_rounds: int = 3,
    server_strategy: Optional[FedProx] = None,
) -> None:
    """
    Starts the Flower federated learning aggregation server.

    Args:
        server_address: Host and port to bind gRPC server (default: 0.0.0.0:8080).
        num_rounds: Number of federated training rounds (default: 3).
        server_strategy: Flower Strategy to use (defaults to global FedProx strategy).
    """
    strat = server_strategy if server_strategy is not None else strategy

    logger.info("=" * 60)
    logger.info("FedGuard - Starting Federated Aggregation Server")
    logger.info(f"Server Address:        {server_address}")
    logger.info(f"FL Strategy:           FedProx (proximal_mu={strat.proximal_mu})")
    logger.info(f"Rounds:                {num_rounds}")
    logger.info(f"Min Available Clients: {strat.min_available_clients}")
    logger.info("=" * 60)

    try:
        config = fl.server.ServerConfig(num_rounds=num_rounds)
        fl.server.start_server(
            server_address=server_address,
            config=config,
            strategy=strat,
        )
    except Exception as e:
        logger.error(f"Error starting Flower server on {server_address}: {e}")
        raise e


if __name__ == "__main__":
    import argparse

    _parser = argparse.ArgumentParser(
        description="FedGuard FL Aggregation Server",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    _parser.add_argument(
        "--server_address",
        type=str,
        default="0.0.0.0:8080",
        help="gRPC server address (host:port).",
    )
    _parser.add_argument(
        "--num_rounds",
        type=int,
        default=3,
        help="Number of federated learning rounds.",
    )
    _args = _parser.parse_args()
    main(server_address=_args.server_address, num_rounds=_args.num_rounds)
