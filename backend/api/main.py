import asyncio
import logging
import os
import sqlite3
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from backend.api.audit_log import get_all_logs
from backend.api.shap_service import get_mock_shap_values

# ---------------------------------------------------------------------------
# Audit DB path (written by backend/fl_server/server.py)
# ---------------------------------------------------------------------------
_API_DIR  = os.path.dirname(os.path.abspath(__file__))          # backend/api/
_BACK_DIR = os.path.abspath(os.path.join(_API_DIR, ".."))       # backend/
AUDIT_DB  = os.path.join(_BACK_DIR, "audit_log.db")


def _fetch_audit_rounds(since_id: int = 0) -> List[Dict[str, Any]]:
    """
    Read new rows from audit_rounds table written by the FL server.
    Returns [] if DB doesn't exist yet (server not started).
    """
    if not os.path.exists(AUDIT_DB):
        return []
    try:
        con = sqlite3.connect(AUDIT_DB, timeout=10.0)
        con.execute("PRAGMA journal_mode=WAL;")
        con.row_factory = sqlite3.Row
        rows = con.execute(
            "SELECT * FROM audit_rounds WHERE id > ? ORDER BY id ASC",
            (since_id,)
        ).fetchall()
        con.close()
        return [dict(r) for r in rows]
    except Exception:
        return []

logger = logging.getLogger("fedguard-api")
logging.basicConfig(level=logging.INFO)

# Pydantic Model for incoming ML Server metrics
class WebhookPayload(BaseModel):
    round: int
    accuracy: float
    loss: float
    epsilon: float
    bank_statuses: dict

# Global State Dictionary for FL Training Simulation & Real-time Metrics
training_state = {
    "is_training": True,
    "current_round": 0,
    "total_rounds": 10,
    "rounds": [],
    "bank_status": {
        "Bank_A": {"status": "READY", "samples": 4500, "epsilon": 0.0},
        "Bank_B": {"status": "READY", "samples": 3800, "epsilon": 0.0},
        "Bank_C": {"status": "READY", "samples": 5200, "epsilon": 0.0},
    },
    "privacy_budget": {
        "target_epsilon": 3.0,
        "delta": 1e-5,
        "current_epsilon": 0.0,
    },
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

SIMULATION_MODE = False

async def simulate_training():
    """
    Background worker that simulates federated learning rounds.
    Increases accuracy and epsilon budget spent every 2 seconds if is_training is True.
    """
    await asyncio.sleep(1.0)
    while True:
        try:
            if SIMULATION_MODE and training_state["is_training"]:
                current = training_state["current_round"]
                if current < training_state["total_rounds"]:
                    current += 1
                    training_state["current_round"] = current

                    # Simulating realistic metric convergence
                    base_acc = 0.72
                    acc_gain = (1 - 0.72) * (1 - (0.75 ** current))
                    round_acc = round(base_acc + acc_gain, 4)
                    round_loss = round(max(0.12, 0.65 * (0.80 ** current)), 4)
                    
                    # Privacy budget accumulation per round (Opacus ε accounting)
                    eps_step = round(0.28 + (0.02 * (current % 3)), 3)
                    new_eps = round(min(3.0, training_state["privacy_budget"]["current_epsilon"] + eps_step), 3)
                    training_state["privacy_budget"]["current_epsilon"] = new_eps

                    # Update bank participant states
                    for bank in training_state["bank_status"]:
                        training_state["bank_status"][bank]["status"] = "AGGREGATING" if current == training_state["total_rounds"] else "TRAINING"
                        training_state["bank_status"][bank]["epsilon"] = new_eps

                    # New round log entry
                    round_data = {
                        "round": current,
                        "global_accuracy": round_acc,
                        "global_loss": round_loss,
                        "epsilon_spent": new_eps,
                        "participating_banks": ["Bank_A", "Bank_B", "Bank_C"],
                        "cosine_similarity_passed": True,
                        "timestamp": round(asyncio.get_running_loop().time(), 2),
                    }
                    training_state["rounds"].append(round_data)

                    # If completed all rounds, mark status
                    if current >= training_state["total_rounds"]:
                        training_state["is_training"] = False
                        for bank in training_state["bank_status"]:
                            training_state["bank_status"][bank]["status"] = "COMPLETED"

                    # Broadcast latest snapshot to all active frontend subscribers
                    await manager.broadcast(training_state)

            await asyncio.sleep(2.0)
        except Exception:
            await asyncio.sleep(2.0)

async def poll_audit_db_loop():
    last_audit_id = 0
    while True:
        await asyncio.sleep(1.0)
        try:
            new_rows = _fetch_audit_rounds(since_id=last_audit_id)
            if new_rows:
                for row in new_rows:
                    last_audit_id = row["id"]
                    rnd = row["round_number"]
                    training_state["current_round"] = rnd

                    eps = row.get("max_epsilon_spent") or 0.0
                    training_state["privacy_budget"]["current_epsilon"] = round(eps, 4)

                    acc = row.get("global_accuracy")
                    round_entry = {
                        "round":                  rnd,
                        "global_accuracy":        acc,
                        "global_loss":            None,
                        "epsilon_spent":          eps,
                        "participating_banks":    ["Bank_A", "Bank_B", "Bank_C"],
                        "cosine_similarity_passed": row.get("poisoned_nodes", 0) == 0,
                        "poisoned_nodes_dropped": row.get("poisoned_nodes", 0),
                        "timestamp":              row.get("timestamp"),
                    }
                    training_state["rounds"].append(round_entry)

                    if rnd >= training_state["total_rounds"]:
                        training_state["is_training"] = False

                await manager.broadcast(training_state)
        except Exception as e:
            logger.error(f"Polling error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the simulation background loop
    task = asyncio.create_task(simulate_training())
    poll_task = asyncio.create_task(poll_audit_db_loop())
    yield
    task.cancel()
    poll_task.cancel()

app = FastAPI(
    title="FedGuard API",
    description="Privacy-Preserving Federated Learning Platform Compliance and Metrics Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", summary="Health Check")
async def health_check():
    return {
        "status": "healthy",
        "service": "FedGuard API",
        "version": "1.0.0"
    }

@app.get("/api/audit-log", summary="Get Immutable Audit Trail")
async def get_audit_log():
    """
    Returns the append-only audit trail of all committed Federated Learning rounds.
    Each entry contains round number, timestamp, gradient hash, epsilon spent, and status.
    """
    return get_all_logs()

VALID_BANK_IDS = ["bank_a", "bank_b", "bank_c"]

@app.get("/api/model/shap-values/{bank_id}", summary="Get Model Explainability (SHAP)")
async def get_shap_values(bank_id: str):
    """
    Returns SHAP feature importance values for the local fraud detection model
    at the specified bank. Simulates per-bank personalized model explanations
    without leaking any raw data (GDPR Art. 22 / DPDP Sec. 12 compliance).
    """
    if bank_id not in VALID_BANK_IDS:
        raise HTTPException(
            status_code=404,
            detail=f"Bank '{bank_id}' not found. Valid options: {VALID_BANK_IDS}"
        )
    try:
        return get_mock_shap_values(bank_id)
    except Exception as e:
        logger.error(f"SHAP value generation failed for bank '{bank_id}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve SHAP values for bank '{bank_id}': {str(e)}"
        )

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """
    WebSocket endpoint streaming live FL metrics.
    """
    await manager.connect(websocket)
    try:
        await websocket.send_json(training_state)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.post("/api/start-training", summary="Trigger Federated Training")
async def start_training():
    """
    Training must be manually started via terminals to prevent gRPC/HTTP collisions.
    """
    training_state["is_training"] = True
    return {
        "status": "listening",
        "message": "Start clients in terminals to begin training"
    }

@app.post("/api/webhook/metrics", summary="Receive Real FL Metrics Webhook")
async def webhook_metrics(payload: WebhookPayload):
    """
    Receives real round metrics from Yash's FL Server, updates global state,
    and broadcasts to all connected frontend clients via WebSocket.
    """
    training_state["current_round"] = payload.round
    training_state["privacy_budget"]["current_epsilon"] = payload.epsilon
    
    if payload.bank_statuses:
        training_state["bank_status"].update(payload.bank_statuses)

    round_entry = {
        "round": payload.round,
        "global_accuracy": payload.accuracy,
        "global_loss": payload.loss,
        "epsilon_spent": payload.epsilon,
        "participating_banks": list(payload.bank_statuses.keys()) if payload.bank_statuses else ["Bank_A", "Bank_B", "Bank_C"],
        "cosine_similarity_passed": True,
        "timestamp": round(asyncio.get_running_loop().time(), 2),
    }
    training_state["rounds"].append(round_entry)

    # Broadcast update to all WebSocket subscribers
    await manager.broadcast(training_state)

    return {"status": "success", "message": f"Metrics for round {payload.round} processed"}

# ---------------------------------------------------------------------------
# X-Factor: Thin-File Credit Scoring Demo
# ---------------------------------------------------------------------------

class ThinFileProfile(BaseModel):
    customer_id:         Optional[str]  = "CUST-DEMO-001"
    age:                 Optional[int]  = 28
    monthly_income:      Optional[float] = 0.0
    credit_history_months: Optional[int] = 0
    num_micro_transactions: Optional[int] = 47
    network_trust_score: Optional[float] = 0.74


@app.post("/api/evaluate-thin-file", summary="Thin-File Credit Risk Evaluation (Demo)")
async def evaluate_thin_file(profile: ThinFileProfile):
    """
    X-Factor demo endpoint: shows how FedGuard's federated global model can
    approve a 'thin-file' customer that a local bank-only model would reject.

    The local model has seen only ~1% of global fraud patterns (bank_c scenario).
    The global federated model has learned cross-bank behavioural signals.
    """
    # Deterministic mock — replace with real model inference in production
    local_confidence  = round(0.30 + (profile.num_micro_transactions or 0) * 0.003, 2)
    local_confidence  = min(local_confidence, 0.64)   # local model caps here
    global_confidence = round(0.72 + (profile.network_trust_score or 0) * 0.22, 2)
    global_confidence = min(global_confidence, 0.97)

    local_status  = "Approved" if local_confidence >= 0.60 else "Rejected"
    global_status = "Approved" if global_confidence >= 0.70 else "Rejected"

    shap_insights = [
        "High micro-transaction consistency across 3-month window",
        "Cross-referenced network trust score above 0.70 threshold",
        "Federated model detected non-zero payment velocity pattern",
    ]
    if profile.credit_history_months == 0:
        shap_insights.append("Zero formal credit history — thin-file flag suppressed by FL model")

    return {
        "customer_id":    profile.customer_id,
        "local_model":    {"status": local_status,  "confidence": local_confidence},
        "global_model":   {"status": global_status, "confidence": global_confidence},
        "delta_uplift":   round(global_confidence - local_confidence, 2),
        "shap_insights":  shap_insights,
        "note": "Global model trained via FedGuard — no raw data shared between banks.",
    }


@app.get("/api/compliance", summary="Get Compliance Mapping")
async def get_compliance_mapping():
    """
    Returns mappings between FedGuard privacy/security components
    and relevant regulatory frameworks: India's DPDP Act 2023 & EU GDPR.
    """
    return {
        "frameworks": ["DPDP Act 2023 (India)", "GDPR (EU)"],
        "compliance_mappings": [
            {
                "id": "comp-1",
                "component": "Differential Privacy (Opacus)",
                "technical_mechanism": "DP-SGD with Gaussian noise calibration and clipping per-sample gradients (ε, δ accounting)",
                "gdpr_mapping": "Article 25: Data Protection by Design and by Default; Recital 26: Anonymous Information",
                "dpdp_mapping": "Section 8(4): Reasonable Security Safeguards; Section 8(5): Data Minimization & Protection",
                "status": "COMPLIANT",
                "risk_mitigation": "Prevents individual client/record reconstruction from aggregated model gradients"
            },
            {
                "id": "comp-2",
                "component": "Zero Raw Data Sharing (Federated Learning)",
                "technical_mechanism": "Flower NumPyClient local training on bank-segregated datasets; only weights leave nodes",
                "gdpr_mapping": "Article 5(1)(c): Data Minimisation; Chapter V (Articles 44-50): Cross-Border Data Transfer Restrictions",
                "dpdp_mapping": "Section 4: Grounds for Processing; Section 16: Cross-border Transfer Restrictions",
                "status": "COMPLIANT",
                "risk_mitigation": "Raw financial transaction records strictly remain in bank perimeter"
            },
            {
                "id": "comp-3",
                "component": "Secure Aggregation (SecAgg / Encryption)",
                "technical_mechanism": "Cryptographic secure multi-party weight aggregation before model updating",
                "gdpr_mapping": "Article 32: Security of Processing (Pseudonymisation and Encryption of Personal Data)",
                "dpdp_mapping": "Section 8(4): Mandatory Technical & Organizational Security Safeguards",
                "status": "COMPLIANT",
                "risk_mitigation": "Server cannot inspect individual bank weight contributions"
            },
            {
                "id": "comp-4",
                "component": "Byzantine Defense (Cosine Similarity Filter)",
                "technical_mechanism": "Server-side gradient vector outlier rejection to detect data/model poisoning attacks",
                "gdpr_mapping": "Article 5(1)(d): Accuracy; Article 32: Availability & Resilience of Processing Systems",
                "dpdp_mapping": "Section 8(3): Accuracy and Completeness of Personal Data",
                "status": "COMPLIANT",
                "risk_mitigation": "Protects global model integrity against adversarial or corrupt client updates"
            },
            {
                "id": "comp-5",
                "component": "Local Explainability (SHAP)",
                "technical_mechanism": "Client-local Tree/Deep SHAP summary generation without transmitting feature spaces",
                "gdpr_mapping": "Article 13(2)(f) & Article 22: Right to Explanation & Protection against Automated Decision-Making",
                "dpdp_mapping": "Section 12: Right to Grievance Redressal & Meaningful Transparency",
                "status": "COMPLIANT",
                "risk_mitigation": "Ensures transparent credit/fraud scoring decisions for bank compliance officers"
            },
            {
                "id": "comp-6",
                "component": "Immutable Audit Log (SQLite)",
                "technical_mechanism": "Append-only cryptographic record of FL rounds, participant IDs, and ε-spent budgets",
                "gdpr_mapping": "Article 5(2): Accountability Principle; Article 30: Records of Processing Activities",
                "dpdp_mapping": "Section 8(6): Accountability and Compliance Logging",
                "status": "COMPLIANT",
                "risk_mitigation": "Provides complete verifiable audit trail for regulatory inspections"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)