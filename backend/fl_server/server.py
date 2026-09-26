"""
FedGuard — backend/fl_server/server.py
========================================
Flower FL Server with SecureAggStrategy.

SecureAggStrategy extends FedAvg with:
  1. Cosine Similarity Byzantine detection — drops clients whose weight
     vector is statistically anomalous before aggregation.
  2. Audit logging — prints per-round epsilon and dropped client IDs.

Run:
    python backend/fl_server/server.py
"""

import warnings
from typing import Optional, Union
from logging import WARNING

import numpy as np
import flwr as fl
from flwr.common import (
    FitRes,
    Parameters,
    Scalar,
    ndarrays_to_parameters,
    parameters_to_ndarrays,
)
from flwr.server.client_proxy import ClientProxy
from flwr.server.strategy import FedAvg
from flwr.common.logger import log

# ---------------------------------------------------------------------------
# Cosine Similarity helpers
# ---------------------------------------------------------------------------

def _flatten_weights(parameters: Parameters) -> np.ndarray:
    """Concatenate all weight arrays into a single 1-D vector."""
    arrays = parameters_to_ndarrays(parameters)
    return np.concatenate([a.flatten() for a in arrays])


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two flat vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def detect_poisoned_clients(
    results: list[tuple[ClientProxy, FitRes]],
    threshold_factor: float = 1.5,
) -> tuple[list[tuple[ClientProxy, FitRes]], list[str]]:
    """
    Cosine Similarity poisoning detection.

    Algorithm:
      1. Flatten each client's parameters into a 1-D vector.
      2. Build a (N × N) pairwise cosine similarity matrix.
      3. For each client i, compute mean_sim[i] = avg of row i (excluding self).
      4. Compute overall mean μ and std σ of mean_sim.
      5. Drop client i if mean_sim[i] < μ - threshold_factor * σ.

    Returns:
        (clean_results, list_of_dropped_client_ids)
    """
    if len(results) < 2:
        return results, []  # Cannot detect with <2 clients

    vectors = [_flatten_weights(fit_res.parameters) for _, fit_res in results]
    n = len(vectors)

    # Build pairwise similarity matrix
    sim_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                sim_matrix[i, j] = _cosine_similarity(vectors[i], vectors[j])

    # Mean similarity per client (exclude self-similarity diagonal)
    np.fill_diagonal(sim_matrix, np.nan)
    mean_sim = np.nanmean(sim_matrix, axis=1)   # shape: (n,)

    overall_mean = float(np.mean(mean_sim))
    overall_std  = float(np.std(mean_sim))
    cutoff       = overall_mean - threshold_factor * overall_std

    clean_results: list[tuple[ClientProxy, FitRes]] = []
    dropped_ids:   list[str] = []

    for i, (proxy, fit_res) in enumerate(results):
        client_id = proxy.cid
        if mean_sim[i] < cutoff:
            log(
                WARNING,
                "[SecAgg] ⚠️  MALICIOUS NODE DETECTED — client_id=%s | "
                "mean_cosine_sim=%.4f < cutoff=%.4f (μ=%.4f, σ=%.4f). "
                "Dropping update.",
                client_id, mean_sim[i], cutoff, overall_mean, overall_std,
            )
            dropped_ids.append(client_id)
        else:
            clean_results.append((proxy, fit_res))

    return clean_results, dropped_ids


# ---------------------------------------------------------------------------
# Custom Strategy
# ---------------------------------------------------------------------------

class SecureAggStrategy(FedAvg):
    """
    FedAvg + Byzantine-robust Cosine Similarity poisoning filter.

    Any client update that is statistically anomalous (mean cosine similarity
    to other clients falls below μ - 1.5σ) is silently dropped before
    the FedAvg weighted average is computed.
    """

    def __init__(self, poisoning_threshold: float = 1.5, **kwargs):
        super().__init__(**kwargs)
        self.poisoning_threshold = poisoning_threshold
        self._round_num = 0

    def aggregate_fit(
        self,
        server_round: int,
        results: list[tuple[ClientProxy, FitRes]],
        failures: list[Union[tuple[ClientProxy, FitRes], BaseException]],
    ) -> tuple[Optional[Parameters], dict[str, Scalar]]:
        """
        1. Run cosine similarity poisoning filter on raw results.
        2. Delegate clean results to FedAvg.aggregate_fit.
        3. Log round summary (clients received, dropped, epsilon budget).
        """
        self._round_num = server_round

        if not results:
            return None, {}

        # --- Poisoning detection ---
        clean_results, dropped_ids = detect_poisoned_clients(
            results, threshold_factor=self.poisoning_threshold
        )

        # Collect privacy metrics reported by clients
        epsilon_values: list[float] = []
        for _, fit_res in clean_results:
            eps = fit_res.metrics.get("epsilon")
            if eps is not None:
                epsilon_values.append(float(eps))

        max_epsilon = max(epsilon_values) if epsilon_values else float("nan")

        # Summary log
        log(
            WARNING,
            "[Round %d] Clients received=%d | Dropped (poisoned)=%d | "
            "Max ε spent=%.4f | Accepted=%d",
            server_round,
            len(results),
            len(dropped_ids),
            max_epsilon,
            len(clean_results),
        )

        if len(clean_results) == 0:
            warnings.warn(
                f"[Round {server_round}] All clients dropped by poisoning filter! "
                "Skipping aggregation.",
                RuntimeWarning,
                stacklevel=2,
            )
            return None, {"dropped_all": True}

        # Aggregate with FedAvg on the clean subset
        aggregated_params, aggregated_metrics = super().aggregate_fit(
            server_round, clean_results, failures
        )

        aggregated_metrics["round"]       = server_round
        aggregated_metrics["dropped"]     = len(dropped_ids)
        aggregated_metrics["max_epsilon"] = max_epsilon

        return aggregated_params, aggregated_metrics


# ---------------------------------------------------------------------------
# Server entry point
# ---------------------------------------------------------------------------

def start_server(
    host: str = "0.0.0.0",
    port: int = 8080,
    num_rounds: int = 10,
    min_clients: int = 2,
    min_available_clients: int = 3,
) -> None:
    """
    Start the Flower FL server with SecureAggStrategy.

    Args:
        host                  : Bind address. Default '0.0.0.0'.
        port                  : Flower gRPC port. Default 8080.
        num_rounds            : Number of FL training rounds.
        min_clients           : Min clients needed to start a round.
        min_available_clients : Min clients that must be registered.
    """
    strategy = SecureAggStrategy(
        poisoning_threshold=1.5,
        fraction_fit=1.0,           # sample all available clients each round
        fraction_evaluate=1.0,
        min_fit_clients=min_clients,
        min_evaluate_clients=min_clients,
        min_available_clients=min_available_clients,
    )

    server_address = f"{host}:{port}"
    print(f"[FedGuard] Starting FL server on {server_address} for {num_rounds} rounds ...")

    fl.server.start_server(
        server_address=server_address,
        config=fl.server.ServerConfig(num_rounds=num_rounds),
        strategy=strategy,
    )


if __name__ == "__main__":
    start_server()
