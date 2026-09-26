"""
FedGuard — backend/fl_server/server.py
========================================
Flower FL Server with SecureAggStrategy (FedProx + Byzantine Defense + Audit Log).

SecureAggStrategy extends FedProx/FedAvg with:
  1. Cosine Similarity Byzantine detection — drops clients whose weight
     vector is statistically anomalous before aggregation.
  2. SQLite Audit Log — appends every round's metrics to backend/audit_log.db.
  3. Weighted metric aggregation with NaN and 0-sample protections.

Run:
    python backend/fl_server/server.py
"""

import os
import sys
import sqlite3
import warnings
from logging import WARNING
from typing import Optional, Union, Dict, List, Tuple, Any

import numpy as np

# ---------------------------------------------------------------------------
# Paths and Monorepo Imports
# ---------------------------------------------------------------------------
_SERVER_DIR  = os.path.dirname(os.path.abspath(__file__))          # backend/fl_server/
_BACKEND_DIR = os.path.abspath(os.path.join(_SERVER_DIR, ".."))    # backend/
_PROJECT_DIR = os.path.abspath(os.path.join(_BACKEND_DIR, ".."))   # repo root

for _p in [_SERVER_DIR, _BACKEND_DIR, _PROJECT_DIR]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

AUDIT_DB = os.path.join(_BACKEND_DIR, "audit_log.db")

# Flower imports with defensive fallbacks for mock/offline validation
try:
    import flwr as fl
    from flwr.common import (
        EvaluateRes,
        FitRes,
        Parameters,
        Scalar,
        parameters_to_ndarrays,
    )
    from flwr.server.client_proxy import ClientProxy
    from flwr.server.strategy import FedProx, FedAvg
    from flwr.common.logger import log
    HAS_FLWR = True
except ImportError:
    HAS_FLWR = False
    class Parameters:  # type: ignore
        pass
    class ClientProxy:  # type: ignore
        def __init__(self, cid: str = "client_0"):
            self.cid = cid
    class FitRes:  # type: ignore
        def __init__(self, parameters: Any = None, num_examples: int = 0, metrics: Dict[str, Any] = None):
            self.parameters = parameters
            self.num_examples = num_examples
            self.metrics = metrics or {}
    class EvaluateRes:  # type: ignore
        def __init__(self, loss: float = 0.0, num_examples: int = 0, metrics: Dict[str, Any] = None):
            self.loss = loss
            self.num_examples = num_examples
            self.metrics = metrics or {}
    Scalar = Union[bool, bytes, float, int, str]  # type: ignore
    def parameters_to_ndarrays(p: Any) -> List[np.ndarray]:  # type: ignore
        return p if isinstance(p, list) else []
    def log(level: int, msg: str, *args: Any) -> None:  # type: ignore
        import logging
        logging.getLogger("FedGuard.Server").log(level, msg, *args)
    class FedAvg:  # type: ignore
        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)
        def aggregate_fit(self, server_round: int, results: Any, failures: Any) -> Tuple[Any, Dict[str, Any]]:
            return None, {}
        def aggregate_evaluate(self, server_round: int, results: Any, failures: Any) -> Tuple[Optional[float], Dict[str, Any]]:
            return 0.0, {}
    class FedProx(FedAvg):  # type: ignore
        def __init__(self, proximal_mu: float = 0.1, **kwargs: Any) -> None:
            self.proximal_mu = proximal_mu
            super().__init__(**kwargs)
    class fl:  # type: ignore
        server = type("server", (), {"ServerConfig": lambda num_rounds=3: None, "start_server": None})()


# Import weighted_average from server.py (handles NaNs and 0-sample edge cases)
try:
    from server import weighted_average
except ImportError:
    def weighted_average(metrics: List[Tuple[int, Dict[str, Any]]]) -> Dict[str, float]:
        target_keys = ["accuracy", "precision", "recall", "f1_score", "roc_auc"]
        sums = {k: 0.0 for k in target_keys}
        counts = {k: 0 for k in target_keys}
        for n, m in metrics:
            if n <= 0:
                continue
            for k in target_keys:
                v = m.get(k)
                if v is not None and not np.isnan(float(v)):
                    sums[k] += float(v) * n
                    counts[k] += n
        return {k: (sums[k] / counts[k]) if counts[k] > 0 else 0.0 for k in target_keys}


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
    results: List[Tuple[ClientProxy, FitRes]],
    threshold_factor: float = 1.5,
) -> Tuple[List[Tuple[ClientProxy, FitRes]], List[str]]:
    """
    Cosine Similarity poisoning detection.

    Algorithm:
      1. Flatten each client's parameters -> 1-D vector.
      2. Build N x N pairwise cosine similarity matrix.
      3. mean_sim[i] = mean of row i (diagonal excluded).
      4. Drop client i if mean_sim[i] < mu - threshold_factor * sigma.

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

    clean_results: List[Tuple[ClientProxy, FitRes]] = []
    dropped_ids:   List[str] = []

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
# Custom Strategy: SecureAggStrategy
# ---------------------------------------------------------------------------

class SecureAggStrategy(FedProx):
    """
    FedProx + Byzantine cosine-similarity filter + SQLite audit logging.

    - Extends FedProx to handle statistical heterogeneity (Non-IID bank splits) via proximal_mu.
    - Waits for all 3 banks (min_available_clients=3, fraction_fit=1.0).
    - Drops poisoned clients before aggregation via cosine similarity anomaly detection.
    - Aggregates evaluation metrics via weighted_average (handling NaNs and 0-sample clients).
    - Writes every round to backend/audit_log.db.
    """

    def __init__(
        self,
        poisoning_threshold: float = 1.5,
        proximal_mu: float = 0.1,
        fraction_fit: float = 1.0,
        fraction_evaluate: float = 1.0,
        min_fit_clients: int = 3,
        min_evaluate_clients: int = 3,
        min_available_clients: int = 3,
        evaluate_metrics_aggregation_fn: Optional[Any] = None,
        **kwargs: Any,
    ) -> None:
        self.poisoning_threshold = poisoning_threshold
        self.proximal_mu = proximal_mu
        self.fraction_fit = fraction_fit
        self.fraction_evaluate = fraction_evaluate
        self.min_fit_clients = min_fit_clients
        self.min_evaluate_clients = min_evaluate_clients
        self.min_available_clients = min_available_clients
        self._last_accuracy: Optional[float] = None

        agg_fn = evaluate_metrics_aggregation_fn or weighted_average
        self.evaluate_metrics_aggregation_fn = agg_fn

        super().__init__(
            proximal_mu=proximal_mu,
            fraction_fit=fraction_fit,
            fraction_evaluate=fraction_evaluate,
            min_fit_clients=min_fit_clients,
            min_evaluate_clients=min_evaluate_clients,
            min_available_clients=min_available_clients,
            evaluate_metrics_aggregation_fn=agg_fn,
            **kwargs,
        )

        _init_audit_db(AUDIT_DB)
        log(WARNING, "[AuditLog] Initialised at %s", AUDIT_DB)

    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, FitRes]],
        failures: List[Union[Tuple[ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:

        if not results:
            return None, {}

        # --- Poisoning detection ---
        clean_results, dropped_ids = detect_poisoned_clients(
            results, threshold_factor=self.poisoning_threshold
        )

        # Collect epsilon values reported by clients
        epsilon_values: List[float] = []
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

        # --- FedProx aggregation on clean subset ---
        aggregated_params, aggregated_metrics = super().aggregate_fit(
            server_round, clean_results, failures
        )

        # --- Audit log write ---
        _write_audit_round(
            AUDIT_DB,
            round_number=server_round,
            global_accuracy=self._last_accuracy,
            max_epsilon_spent=max_epsilon,
            poisoned_nodes=len(dropped_ids),
            clients_accepted=len(clean_results),
        )

        if aggregated_metrics is None:
            aggregated_metrics = {}

        aggregated_metrics.update({
            "round":       server_round,
            "dropped":     len(dropped_ids),
            "max_epsilon": max_epsilon,
        })

        return aggregated_params, aggregated_metrics

    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, EvaluateRes]],
        failures: List[Union[Tuple[ClientProxy, EvaluateRes], BaseException]],
    ) -> Tuple[Optional[float], Dict[str, Scalar]]:
        """Capture aggregated accuracy so audit_fit can reference it."""
        loss, metrics = super().aggregate_evaluate(server_round, results, failures)

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
# Strategy Initializer & Global Instance
# ---------------------------------------------------------------------------

def init_fedprox_strategy(
    fraction_fit: float = 1.0,
    fraction_evaluate: float = 1.0,
    min_fit_clients: int = 3,
    min_evaluate_clients: int = 3,
    min_available_clients: int = 3,
    proximal_mu: float = 0.1,
    poisoning_threshold: float = 1.5,
) -> SecureAggStrategy:
    """Instantiate SecureAggStrategy adhering to FinTech requirements."""
    return SecureAggStrategy(
        poisoning_threshold=poisoning_threshold,
        proximal_mu=proximal_mu,
        fraction_fit=fraction_fit,
        fraction_evaluate=fraction_evaluate,
        min_fit_clients=min_fit_clients,
        min_evaluate_clients=min_evaluate_clients,
        min_available_clients=min_available_clients,
        evaluate_metrics_aggregation_fn=weighted_average,
    )


# Default strategy instance
strategy: SecureAggStrategy = init_fedprox_strategy(
    fraction_fit=1.0,
    fraction_evaluate=1.0,
    min_fit_clients=3,
    min_evaluate_clients=3,
    min_available_clients=3,
    proximal_mu=0.1,
)


# ---------------------------------------------------------------------------
# Server entry points
# ---------------------------------------------------------------------------

def start_server(
    host: str = "0.0.0.0",
    port: int = 8080,
    num_rounds: int = 10,
    server_strategy: Optional[SecureAggStrategy] = None,
) -> None:
    strat = server_strategy if server_strategy is not None else strategy
    server_address = f"{host}:{port}"
    print(f"[FedGuard] FL server starting on {server_address} | rounds={num_rounds}")
    print(f"[FedGuard] Strategy: {type(strat).__name__} (proximal_mu={strat.proximal_mu})")
    print(f"[FedGuard] Audit log -> {AUDIT_DB}")
    print(f"[FedGuard] Waiting for {strat.min_available_clients} bank clients ...")

    if HAS_FLWR:
        fl.server.start_server(
            server_address=server_address,
            config=fl.server.ServerConfig(num_rounds=num_rounds),
            strategy=strat,
        )
    else:
        print("[FedGuard] Flower (flwr) not installed in local environment.")


def main(
    server_address: str = "0.0.0.0:8080",
    num_rounds: int = 3,
    server_strategy: Optional[SecureAggStrategy] = None,
) -> None:
    parts = server_address.split(":")
    host = parts[0]
    port = int(parts[1]) if len(parts) > 1 else 8080
    start_server(host=host, port=port, num_rounds=num_rounds, server_strategy=server_strategy)


if __name__ == "__main__":
    start_server()
