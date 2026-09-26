import logging

logger = logging.getLogger("fedguard-audit")


def get_all_logs() -> list[dict]:
    """
    Retrieves the immutable audit log of all committed Federated Learning rounds.
    Currently returns hardcoded mock data. Will be replaced with SQLite queries
    once Tanishq's audit DB is wired in.
    Returns an empty list on any exception (e.g., locked/missing SQLite file).
    """
    try:
        return [
            {
                "round": 1,
                "timestamp": "2026-09-26T06:00:01Z",
                "gradient_hash": "a3f1c2e4b5d6a7f8e9c0d1b2a3f4c5e6d7b8a9f0e1c2d3b4a5f6c7e8d9b0a1f2",
                "epsilon_spent": 0.28,
                "status": "COMMITTED",
            },
            {
                "round": 2,
                "timestamp": "2026-09-26T06:00:03Z",
                "gradient_hash": "b4e2d3f5c6e7b8g9f0a1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3",
                "epsilon_spent": 0.56,
                "status": "COMMITTED",
            },
            {
                "round": 3,
                "timestamp": "2026-09-26T06:00:05Z",
                "gradient_hash": "c5f3e4g6d7f8c9h0g1b2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4",
                "epsilon_spent": 0.86,
                "status": "COMMITTED",
            },
        ]
    except Exception as e:
        logger.error(f"Failed to retrieve audit log: {e}. Returning empty list.")
        return []
