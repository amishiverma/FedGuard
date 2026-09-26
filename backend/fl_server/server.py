"""
FedGuard — backend/fl_server/server.py
========================================
Flower FL Server with SecureAggStrategy.

SecureAggStrategy extends FedAvg with:
  1. Cosine Similarity Byzantine detection — drops clients whose weight
     vector is statistically anomalous before aggregation.
  2. SQLite Audit Log — appends every round's metrics to backend/audit_log.db.

Run:
    python backend/fl_server/server.py
"""

import os
import sqlite3
import warnings
from logging import WARNING
from typing import Optional, Union

import numpy as np
import flwr as fl
from flwr.common import (
    EvaluateRes,
    FitRes,
    Parameters,
    Scalar,
    parameters_to_ndarrays,
)
from flwr.server.client_proxy import ClientProxy
from flwr.server.strategy import FedAvg
from flwr.common.logger import log

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_SERVER_DIR  = os.path.dirname(os.path.abspath(__file__))          # backend/fl_server/
_BACKEND_DIR = os.path.abspath(os.path.join(_SERVER_DIR, ".."))    # backend/
AUDIT_DB     = os.path.join(_BACKEND_DIR, "audit_log.db")


# ---------------------------------------------------------------------------
# Audit Log (SQLite — append-only)
# ---------------------------------------------------------------------------

def _init_audit_db(db_path: str) -> None:
    """Create the audit_rounds table if it doesn't exist."""
    con = sqlite3.connect(db_path)
    con.execute("""
        CREATE TABLE IF NOT EXISTS audit_rounds (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            round_number        INTEGER NOT NULL,
            global_accuracy     REAL,
            max_epsilon_spent   REAL,
            poisoned_nodes      INTEGER DEFAULT 0,
            clients_accepted    INTEGER DEFAULT 0,
            timestamp           DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    con.commit()
    con.close()


def _write_audit_round(
    db_path: str,
    round_number: int,
    global_accuracy: Optional[float],
    max_epsilon_spent: float,
    poisoned_nodes: int,
    clients_accepted: int,
) -> None:
    """Append one round record to the audit log (non-blocking, best-effort)."""
    try:
        con = sqlite3.connect(db_path)
        con.execute(
            """
            INSERT INTO audit_rounds
                (round_number, global_accuracy, max_epsilon_spent, poisoned_nodes, clients_accepted)
            VALUES (?, ?, ?, ?, ?)
            """,
            (round_number, global_accuracy, max_epsilon_spent, poisoned_nodes, clients_accepted),
        )
        con.commit()
        con.close()
    except Exception as exc:
        log(WARNING, "[AuditLog] Write failed for round %d: %s", round_number, exc)


# ---------------------------------------------------------------------------
# Cosine Similarity helpers
# ---------------------------------------------------------------------------

def _flatten_weights(parameters: Parameters) -> np.ndarray:
    """Concatenate all weight arrays into a single 1-D vector."""
    arrays = parameters_to_ndarrays(parameters)
    return np.concatenate([a.flatten() for a in arrays])


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
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
      1. Flatten each client's parameters → 1-D vector.
      2. Build N×N pairwise cosine similarity matrix.
      3. mean_sim[i] = mean of row i (diagonal excluded).
      4. Drop client i if mean_sim[i] < μ - threshold_factor * σ.

    Returns:
        (clean_results, list_of_dropped_client_ids)
    """
    if len(results) < 2:
        return results, []

    vectors = [_flatten_weights(fit_res.parameters) for _, fit_res in results]
    n = len(vectors)

    sim_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                sim_matrix[i, j] = _cosine_similarity(vectors[i], vectors[j])

    np.fill_diagonal(sim_matrix, np.nan)
    mean_sim = np.nanmean(sim_matrix, axis=1)

    overall_mean = float(np.mean(mean_sim))
    overall_std  = float(np.std(mean_sim))
    cutoff       = overall_mean - threshold_factor * overall_std

    clean_results: list[tuple[ClientProxy, FitRes]] = []
    dropped_ids:   list[str] = []

    for i, (proxy, fit_res) in enumerate(results):
        if mean_sim[i] < cutoff:
            log(
                WARNING,
                "[SecAgg] MALICIOUS NODE DETECTED — client_id=%s | "
                "mean_cosine_sim=%.4f < cutoff=%.4f (mu=%.4f, sigma=%.4f). Dropping.",
                proxy.cid, mean_sim[i], cutoff, overall_mean, overall_std,
            )
            dropped_ids.append(proxy.cid)
        else:
            clean_results.append((proxy, fit_res))

    return clean_results, dropped_ids


# ---------------------------------------------------------------------------
# Custom Strategy
# ---------------------------------------------------------------------------

class SecureAggStrategy(FedAvg):
    """
    FedAvg + Byzantine cosine-similarity filter + SQLite audit logging.

    - Waits for all 3 banks (min_available_clients=3, fraction_fit=1.0).
    - Drops poisoned clients before aggregation.
    - Writes every round to backend/audit_log.db.
    """

    def __init__(self, poisoning_threshold: float = 1.5, **kwargs):
        super().__init__(**kwargs)
        self.poisoning_threshold = poisoning_threshold
        # Track per-round evaluate metrics to cross-reference in audit log
        self._last_accuracy: Optional[float] = None
        _init_audit_db(AUDIT_DB)
        log(WARNING, "[AuditLog] Initialised at %s", AUDIT_DB)

    def aggregate_fit(
        self,
        server_round: int,
        results: list[tuple[ClientProxy, FitRes]],
        failures: list[Union[tuple[ClientProxy, FitRes], BaseException]],
    ) -> tuple[Optional[Parameters], dict[str, Scalar]]:

        if not results:
            return None, {}

        # --- Poisoning detection ---
        clean_results, dropped_ids = detect_poisoned_clients(
            results, threshold_factor=self.poisoning_threshold
        )

        # Collect epsilon values reported by clients
        epsilon_values: list[float] = []
        for _, fit_res in clean_results:
            eps = fit_res.metrics.get("epsilon")
            if eps is not None:
                epsilon_values.append(float(eps))

        max_epsilon = max(epsilon_values) if epsilon_values else 0.0

        log(
            WARNING,
            "[Round %d] received=%d | poisoned_dropped=%d | accepted=%d | max_epsilon=%.4f",
            server_round, len(results), len(dropped_ids), len(clean_results), max_epsilon,
        )

        if not clean_results:
            warnings.warn(
                f"[Round {server_round}] All clients dropped — skipping aggregation.",
                RuntimeWarning, stacklevel=2,
            )
            _write_audit_round(
                AUDIT_DB, server_round, None, max_epsilon,
                poisoned_nodes=len(dropped_ids), clients_accepted=0,
            )
            return None, {"dropped_all": True}

        # --- FedAvg aggregation on clean subset ---
        aggregated_params, aggregated_metrics = super().aggregate_fit(
            server_round, clean_results, failures
        )

        # --- Audit log write ---
        _write_audit_round(
            AUDIT_DB,
            round_number=server_round,
            global_accuracy=self._last_accuracy,   # populated after evaluate
            max_epsilon_spent=max_epsilon,
            poisoned_nodes=len(dropped_ids),
            clients_accepted=len(clean_results),
        )

        aggregated_metrics.update({
            "round":       server_round,
            "dropped":     len(dropped_ids),
            "max_epsilon": max_epsilon,
        })

        return aggregated_params, aggregated_metrics

    def aggregate_evaluate(
        self,
        server_round: int,
        results: list[tuple[ClientProxy, EvaluateRes]],
        failures: list[Union[tuple[ClientProxy, EvaluateRes], BaseException]],
    ) -> tuple[Optional[float], dict[str, Scalar]]:
        """Capture aggregated accuracy so audit_fit can reference it."""
        loss, metrics = super().aggregate_evaluate(server_round, results, failures)

        # Weighted average accuracy from evaluate results
        if results:
            total_samples = sum(r.num_examples for _, r in results)
            weighted_acc  = sum(
                r.metrics.get("accuracy", 0.0) * r.num_examples
                for _, r in results
            ) / max(total_samples, 1)
            self._last_accuracy = round(weighted_acc, 6)
            log(WARNING, "[Round %d] Global accuracy=%.4f", server_round, self._last_accuracy)

        return loss, metrics


# ---------------------------------------------------------------------------
# Server entry point
# ---------------------------------------------------------------------------

def start_server(
    host: str = "0.0.0.0",
    port: int = 8080,
    num_rounds: int = 10,
) -> None:
    strategy = SecureAggStrategy(
        poisoning_threshold=1.5,
        fraction_fit=1.0,               # use ALL available clients each round
        fraction_evaluate=1.0,
        min_fit_clients=3,              # require all 3 banks
        min_evaluate_clients=3,
        min_available_clients=3,        # block until all 3 banks connect
    )

    server_address = f"{host}:{port}"
    print(f"[FedGuard] FL server starting on {server_address} | rounds={num_rounds}")
    print(f"[FedGuard] Audit log → {AUDIT_DB}")
    print(f"[FedGuard] Waiting for 3 bank clients ...")

    fl.server.start_server(
        server_address=server_address,
        config=fl.server.ServerConfig(num_rounds=num_rounds),
        strategy=strategy,
    )


if __name__ == "__main__":
    start_server()
