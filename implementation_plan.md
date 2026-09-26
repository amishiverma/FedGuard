# 🏦 FedGuard: Federated Financial Risk Intelligence Platform
### ENIGMA FinTech Hackathon — Implementation Plan
### Track: Federated Learning for Cross-Institution Financial Risk

---

> **Elevator Pitch:** A privacy-preserving, federated AI platform where banks collaboratively train a fraud & credit risk model — without ever sharing a single byte of raw customer data — protected by Differential Privacy and auditable by design.

---

## 1. Problem Statement Recap

| Pain Point | Real-World Impact |
|---|---|
| Data Silos | HDFC sees loan defaults, ICICI sees card fraud, PhonePe sees UPI fraud — none see the full picture |
| Legal Barriers | India's DPDP Act, GDPR, China's PIPL prohibit raw data sharing across institutions |
| Thin-File Blindspot | New-to-credit customers are underserved because any single bank has too little data |
| Reactive Detection | Fraud is caught post-loss, not pre-emptively |

---

## 2. Solution Architecture — FedGuard

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEDGUARD PLATFORM                            │
│                                                                 │
│  ┌──────────────┐    ①  Download Global Model                  │
│  │  FL Server   │◄────────────────────────────────────────┐    │
│  │  (Flower)    │                                         │    │
│  │  + FedAvg    │    ④  Aggregated DP-protected updates   │    │
│  │  + Secure    │─────────────────────────────────────►   │    │
│  │    Agg       │                                         │    │
│  └──────┬───────┘                                         │    │
│         │                                                 │    │
│         │  FastAPI + WebSocket                            │    │
│         ▼                                                 │    │
│  ┌──────────────┐   Live Metrics Stream                   │    │
│  │  Dashboard   │◄──────────────────────────────────      │    │
│  │  (Next.js)   │                                         │    │
│  └──────────────┘                                         │    │
│                                                           │    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │    │
│  │  Bank A    │  │  Bank B    │  │  Lending   │          │    │
│  │  (HDFC)    │  │  (ICICI)   │  │  App (PP)  │──────────┘    │
│  │            │  │            │  │            │               │
│  │ ② Local    │  │ ② Local    │  │ ② Local    │               │
│  │   Train    │  │   Train    │  │   Train    │               │
│  │            │  │            │  │            │               │
│  │ ③ DP Noise │  │ ③ DP Noise │  │ ③ DP Noise │               │
│  │   Applied  │  │   Applied  │  │   Applied  │               │
│  │            │  │            │  │            │               │
│  │ Raw Data   │  │ Raw Data   │  │ Raw Data   │               │
│  │ STAYS HERE │  │ STAYS HERE │  │ STAYS HERE │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works — The 4-Step Cycle

1. **Download** — Each bank node pulls the current Global Model from the FL Server
2. **Local Training** — Each bank trains on its own siloed data (data never leaves)
3. **DP Noise** — Gaussian noise is added to gradients via **Opacus** (Differential Privacy)
4. **Secure Aggregation** — Server runs **FedAvg** on the noisy updates → smarter Global Model

---

## 3. Improvements Over Original Plan

### What the Original Plan Got Right
- Flower (flwr) framework choice
- Differential Privacy via Opacus
- Non-IID data splitting
- Docker for simulation
- FastAPI + Next.js stack

### What We're Adding (The Winning Edge)

| # | Improvement | Why It Matters |
|---|---|---|
| 1 | **Secure Aggregation (SecAgg)** | Even the server can't see individual bank updates — adds another privacy layer on top of DP |
| 2 | **Privacy Budget Tracker (ε-δ accounting)** | Show judges a live "Privacy Budget Consumed" gauge — makes DP tangible, not abstract |
| 3 | **Non-IID Dirichlet Partitioning** | More realistic simulation using Dirichlet(α=0.5) split instead of random — mimics real-world label imbalance |
| 4 | **Audit Log / Explainability Panel** | Blockchain-inspired append-only audit trail showing who contributed, when, and what ε was spent — for regulatory compliance demo |
| 5 | **SHAP Feature Importance per Bank** | Show which features each bank's local model finds important (without leaking data) — impressive for judges |
| 6 | **Model Poisoning Detection** | Cosine similarity check on incoming gradients to flag Byzantine/malicious clients — real security concern |
| 7 | **Personalized FL (FedProx)** | Each bank also keeps a personalized local model, not just the global one — better accuracy per institution |
| 8 | **Regulatory Compliance Mapping Panel** | UI panel explicitly mapping each system component to DPDP Act / GDPR article it satisfies |

---

## 4. Tech Stack (Final)

```
┌─────────────────────────────────────────────────────────┐
│                    TECH STACK                           │
├─────────────────┬───────────────────────────────────────┤
│ FL Framework    │ Flower (flwr) 1.x                      │
│ ML Model        │ XGBoost (tabular) + PyTorch (NN)       │
│ Privacy (DP)    │ Opacus (PyTorch DP)                    │
│ Secure Agg      │ Flower SecAgg+ Protocol                │
│ SHAP            │ shap library                           │
│ Backend API     │ FastAPI + WebSockets (uvicorn)         │
│ Database        │ SQLite (audit log, round history)      │
│ Frontend        │ Next.js 14 + Tailwind CSS              │
│ Charts          │ Recharts (live accuracy/loss graphs)   │
│ Deployment      │ Docker + Docker Compose (3 banks)      │
│ Dataset         │ Kaggle Credit Card Fraud Detection     │
│ Privacy Budget  │ Opacus RDPAccountant (ε tracking)      │
└─────────────────┴───────────────────────────────────────┘
```

---

## 5. Dataset & Data Engineering (Tanishq's Domain)

### Dataset
- **Primary:** Kaggle Credit Card Fraud Detection — 284,807 transactions, 492 frauds (0.17% imbalance)
- **Backup:** Home Credit Default Risk (for credit scoring angle)

### Data Splitting Strategy — Non-IID (Dirichlet)

```python
# non_iid_split.py
import numpy as np
import pandas as pd

def dirichlet_split(df: pd.DataFrame, num_clients: int = 3, alpha: float = 0.5, seed: int = 42) -> list:
    """
    Dirichlet partitioning — creates realistic Non-IID splits.
    alpha=0.5 → moderately heterogeneous (like real banks)
    alpha=0.1 → extremely heterogeneous
    alpha=100 → nearly IID
    """
    np.random.seed(seed)
    label_col = "Class"  # fraud label
    labels = df[label_col].values
    n_classes = len(np.unique(labels))

    client_indices = [[] for _ in range(num_clients)]

    for cls in range(n_classes):
        cls_indices = np.where(labels == cls)[0]
        np.random.shuffle(cls_indices)
        proportions = np.random.dirichlet([alpha] * num_clients)
        proportions = (proportions * len(cls_indices)).astype(int)
        proportions[-1] = len(cls_indices) - proportions[:-1].sum()

        idx = 0
        for client_id, prop in enumerate(proportions):
            client_indices[client_id].extend(cls_indices[idx:idx + prop].tolist())
            idx += prop

    return [df.iloc[indices].reset_index(drop=True) for indices in client_indices]
```

### Differential Privacy Implementation

```python
# dp_training.py (using Opacus)
from opacus import PrivacyEngine

def attach_dp_engine(model, optimizer, data_loader, target_epsilon=1.0, target_delta=1e-5, max_grad_norm=1.0):
    """
    Attaches Opacus PrivacyEngine to enforce (epsilon, delta)-DP.
    target_epsilon=1.0 → strong privacy guarantee
    """
    privacy_engine = PrivacyEngine()
    model, optimizer, data_loader = privacy_engine.make_private_with_epsilon(
        module=model,
        optimizer=optimizer,
        data_loader=data_loader,
        epochs=3,
        target_epsilon=target_epsilon,
        target_delta=target_delta,
        max_grad_norm=max_grad_norm,
    )
    return model, optimizer, data_loader, privacy_engine

def get_privacy_spent(privacy_engine) -> dict:
    """Returns current privacy budget consumed."""
    epsilon = privacy_engine.get_epsilon(delta=1e-5)
    return {"epsilon": round(epsilon, 4), "delta": 1e-5}
```

**Key Insight for Judges:** We implement ε-δ accounting so the dashboard shows a real-time "Privacy Budget" gauge. As training rounds increase, ε increases — demonstrating the privacy-utility trade-off visually.

---

## 6. FL Server (Yash's Domain)

### Flower Server with FedAvg + Poisoning Detection

```python
# server.py
import flwr as fl
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class SecureAggStrategy(fl.server.strategy.FedAvg):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.round_metrics = []

    def aggregate_fit(self, server_round, results, failures):
        # --- POISONING DETECTION ---
        weight_vectors = []
        for _, res in results:
            params = fl.common.parameters_to_ndarrays(res.parameters)
            vec = np.concatenate([w.flatten() for w in params])
            weight_vectors.append(vec)

        sim_matrix = cosine_similarity(weight_vectors)
        avg_similarities = sim_matrix.mean(axis=1)
        threshold = avg_similarities.mean() - 2 * avg_similarities.std()

        clean_results = [
            (client, res) for i, (client, res) in enumerate(results)
            if avg_similarities[i] >= threshold
        ]

        if len(clean_results) < len(results):
            print(f"Round {server_round}: Filtered {len(results) - len(clean_results)} suspicious client(s)")

        return super().aggregate_fit(server_round, clean_results, failures)

    def aggregate_evaluate(self, server_round, results, failures):
        aggregated = super().aggregate_evaluate(server_round, results, failures)
        if aggregated:
            loss, metrics = aggregated
            self.round_metrics.append({
                "round": server_round,
                "loss": loss,
                "accuracy": metrics.get("accuracy", 0),
                "f1_score": metrics.get("f1_score", 0),
                "auc_roc": metrics.get("auc_roc", 0),
            })
        return aggregated

def start_server(num_rounds: int = 10):
    strategy = SecureAggStrategy(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=3,
        min_evaluate_clients=3,
        min_available_clients=3,
    )
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=num_rounds),
        strategy=strategy,
    )
```

---

## 7. FL Client (Yash + Tanishq)

```python
# client.py
import flwr as fl
import torch
from dp_training import attach_dp_engine, get_privacy_spent

class BankFLClient(fl.client.NumPyClient):
    def __init__(self, bank_id, model, train_loader, val_loader):
        self.bank_id = bank_id
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.privacy_engine = None
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=1e-3)

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)

        if self.privacy_engine is None:
            self.model, self.optimizer, self.train_loader, self.privacy_engine = \
                attach_dp_engine(self.model, self.optimizer, self.train_loader)

        self.model.train()
        for _ in range(3):  # local epochs
            for X, y in self.train_loader:
                self.optimizer.zero_grad()
                loss = torch.nn.BCEWithLogitsLoss()(self.model(X).squeeze(), y.float())
                loss.backward()
                self.optimizer.step()

        privacy_spent = get_privacy_spent(self.privacy_engine)
        return self.get_parameters(config={}), len(self.train_loader.dataset), privacy_spent

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        # compute loss, accuracy, F1, AUC-ROC
        return float(loss), len(self.val_loader.dataset), {"accuracy": acc, "f1_score": f1, "auc_roc": auc}
```

---

## 8. Backend API (Vrinda's Domain)

### FastAPI with WebSocket Streaming

```python
# api/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI(title="FedGuard API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

training_state = {
    "rounds": [],
    "bank_status": {"bank_a": "idle", "bank_b": "idle", "bank_c": "idle"},
    "privacy_budget": {"bank_a": 0.0, "bank_b": 0.0, "bank_c": 0.0},
    "global_accuracy": 0.0,
    "is_training": False,
}

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """Streams live training metrics to the dashboard."""
    await websocket.accept()
    last_round = 0
    while True:
        if len(training_state["rounds"]) > last_round:
            await websocket.send_json(training_state)
            last_round = len(training_state["rounds"])
        await asyncio.sleep(0.5)

@app.get("/api/audit-log")
async def get_audit_log():
    """Returns the append-only audit trail for compliance demo."""
    pass  # query SQLite

@app.post("/api/start-training")
async def start_training(num_rounds: int = 10):
    """Triggers the FL training process."""
    pass

@app.get("/api/model/shap-values/{bank_id}")
async def get_shap_values(bank_id: str):
    """Returns SHAP feature importances for a specific bank's local model."""
    pass
```

---

## 9. Frontend Dashboard (Amishi's Domain)

### Pages & Panels

```
/dashboard
  ├── /overview          → Global view: accuracy chart, round counter, live bank status
  ├── /bank/[id]         → Per-bank view: local loss, privacy budget gauge, SHAP chart
  ├── /privacy           → DP: epsilon-delta tracker, privacy budget remaining
  ├── /compliance        → Regulatory mapping: DPDP Act / GDPR article alignment
  └── /audit             → Audit log: immutable round history table
```

### Key UI Components

| Component | Library | What It Shows |
|---|---|---|
| GlobalAccuracyChart | Recharts LineChart | Accuracy improving over FL rounds |
| PrivacyBudgetGauge | Recharts RadialBar | Live ε consumed vs. budget |
| BankStatusCards | Custom CSS | "Training", "Uploading", "Idle" per bank |
| DataFlowAnimation | Framer Motion | Animated arrows showing ONLY model weights moving |
| SHAPBarChart | Recharts BarChart | Feature importance without raw data |
| AuditLogTable | TanStack Table | Immutable compliance trail |
| CompliancePanel | Custom | Maps each component to DPDP/GDPR article |

### Critical Animation — The Judge Wow Factor
Animate model weights (not data) flowing from banks to server to banks. Use Framer Motion with a clear visual label: "Gradients (encrypted)" and "Data (stays here)". This is the single most important visual for a non-technical judge.

---

## 10. Project Structure

```
fedguard/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── server.py              # Flower FL Server + FedAvg strategy
│   └── requirements.txt
├── client/
│   ├── Dockerfile
│   ├── client.py              # Flower FL Client (runs per bank)
│   ├── model.py               # PyTorch fraud detection model
│   ├── dp_training.py         # Opacus DP integration
│   └── requirements.txt
├── data/
│   ├── raw/                   # Kaggle dataset
│   ├── non_iid_split.py       # Dirichlet partitioning script
│   └── splits/
│       ├── bank_a.csv
│       ├── bank_b.csv
│       └── bank_c.csv
├── api/
│   ├── Dockerfile
│   ├── main.py                # FastAPI + WebSocket
│   ├── audit_log.py           # SQLite audit trail
│   ├── shap_service.py        # SHAP value computation
│   └── requirements.txt
└── frontend/
    ├── Dockerfile
    ├── app/
    │   ├── page.tsx
    │   ├── dashboard/
    │   │   ├── page.tsx
    │   │   ├── bank/[id]/page.tsx
    │   │   ├── privacy/page.tsx
    │   │   ├── compliance/page.tsx
    │   │   └── audit/page.tsx
    │   └── components/
    │       ├── GlobalAccuracyChart.tsx
    │       ├── PrivacyBudgetGauge.tsx
    │       ├── BankStatusCards.tsx
    │       ├── DataFlowAnimation.tsx
    │       ├── SHAPBarChart.tsx
    │       └── AuditLogTable.tsx
    ├── package.json
    └── tailwind.config.ts
```

---

## 11. Docker Compose — 3-Bank Simulation

```yaml
# docker-compose.yml
version: "3.8"

services:
  fl-server:
    build: ./server
    ports:
      - "8080:8080"
    networks: [fedguard-net]

  api:
    build: ./api
    ports:
      - "8000:8000"
    depends_on: [fl-server]
    networks: [fedguard-net]

  bank-a:
    build: ./client
    environment:
      - BANK_ID=bank_a
      - DATA_PATH=/data/bank_a.csv
      - SERVER_ADDRESS=fl-server:8080
    volumes:
      - ./data/splits:/data
    depends_on: [fl-server]
    networks: [fedguard-net]

  bank-b:
    build: ./client
    environment:
      - BANK_ID=bank_b
      - DATA_PATH=/data/bank_b.csv
      - SERVER_ADDRESS=fl-server:8080
    volumes:
      - ./data/splits:/data
    depends_on: [fl-server]
    networks: [fedguard-net]

  bank-c:
    build: ./client
    environment:
      - BANK_ID=bank_c
      - DATA_PATH=/data/bank_c.csv
      - SERVER_ADDRESS=fl-server:8080
    volumes:
      - ./data/splits:/data
    depends_on: [fl-server]
    networks: [fedguard-net]

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on: [api]
    networks: [fedguard-net]

networks:
  fedguard-net:
    driver: bridge
```

---

## 12. Metrics to Track & Show

| Metric | Why Judges Care |
|---|---|
| Global Model Accuracy (per round) | Proof of learning without data sharing |
| Global F1-Score | More meaningful for imbalanced fraud data |
| Global AUC-ROC | Industry-standard fraud detection metric |
| Per-bank Local Loss | Shows personalized learning |
| Privacy Budget ε (per bank) | Makes DP concrete and measurable |
| Poisoned Client Detections | Demonstrates security robustness |
| Audit Log Entries | Regulatory compliance credibility |
| Round Latency | System performance |

---

## 13. Role Division (Updated)

### Tanishq — Data Engineer & Privacy Officer
- [ ] Download and explore Kaggle Credit Card Fraud dataset
- [ ] Implement Dirichlet Non-IID split (non_iid_split.py)
- [ ] Integrate Opacus DP into client training loop (dp_training.py)
- [ ] Implement ε-δ accountant and expose via API
- [ ] Write Audit Log service (SQLite, append-only, with gradient hash)
- [ ] Create the Compliance Mapping JSON (DPDP Act / GDPR to component)
- [ ] NEW: Implement Model Poisoning Detection in server strategy

### Yash — ML & FL Architect
- [ ] Design PyTorch fraud detection model (model.py)
- [ ] Implement Flower server with custom SecureAggStrategy (server.py)
- [ ] Implement Flower client (client.py)
- [ ] Integrate SHAP for local feature importance
- [ ] Tune FedAvg hyperparameters (num_rounds, fraction_fit)
- [ ] NEW: Implement FedProx regularization for better convergence on Non-IID data

### Vrinda — Backend & Integration Engineer
- [ ] Build FastAPI application (api/main.py)
- [ ] Implement WebSocket /ws/metrics endpoint for live streaming
- [ ] Create REST endpoints: /start-training, /audit-log, /shap-values/{bank_id}
- [ ] Integrate with Flower server to capture round metrics
- [ ] Set up SQLite for persistent audit log
- [ ] NEW: Build /api/compliance endpoint returning DPDP/GDPR mapping

### Amishi — Frontend Developer
- [ ] Set up Next.js 14 project with Tailwind CSS
- [ ] Build /dashboard/overview with global accuracy + bank status cards
- [ ] Build per-bank /dashboard/bank/[id] with local metrics + SHAP chart
- [ ] Build /dashboard/privacy with ε-δ gauge (biggest visual wow factor)
- [ ] Build /dashboard/compliance panel (DPDP Act / GDPR article alignment)
- [ ] Build /dashboard/audit log table
- [ ] NEW: Build DataFlowAnimation using Framer Motion

---

## 14. Implementation Timeline (48-Hour Hackathon)

```
Hour 0-4:   Setup & Data
  - Clone repo, set up Docker
  - Download Kaggle dataset
  - Run non_iid_split.py, verify 3 splits
  - Scaffold all 5 services

Hour 4-12:  Core FL + DP (Critical Path)
  - Yash: Flower server + client working end-to-end
  - Tanishq: Opacus integrated, epsilon tracking working
  - Vrinda: FastAPI + WebSocket skeleton serving mock data
  - Amishi: Next.js scaffold + Recharts accuracy chart wired to mock WS

Hour 12-20: Integration
  - Connect real Flower metrics to FastAPI to Frontend WebSocket
  - Audit log service live
  - SHAP values computing and serving
  - All Docker containers running together

Hour 20-30: Polish & Features
  - Poisoning detection working
  - Privacy budget gauge live
  - DataFlowAnimation built
  - Compliance panel complete
  - Per-bank views working

Hour 30-40: Testing & Demo Prep
  - Full end-to-end run: docker-compose up → 10 FL rounds → live dashboard
  - Record a demo video as backup
  - Fix any bugs

Hour 40-48: Final Polish
  - README.md with architecture diagram
  - Pitch deck alignment
  - Practice demo flow
  - Edge case testing
```

---

## 15. Pitch Script Outline (For Demo)

1. **Hook (30s):** "Imagine a fraudster who defaults at HDFC, maxes cards at ICICI, and commits UPI fraud on PhonePe. Each bank is blind to the others. FedGuard fixes that — without any of them sharing a single byte of customer data."

2. **Problem (60s):** Show the compliance problem — DPDP Act article, raw data sharing = illegal, current = siloed, weak models.

3. **Live Demo (3 min):**
   - Open dashboard, click "Start Training"
   - Show bank status cards lighting up "Training…"
   - Show the DataFlowAnimation: weights to server, data stays at banks
   - Watch global accuracy climb from ~70% to ~92% over 10 rounds
   - Show ε gauge ticking up — "This is the privacy cost, and it's within our budget"
   - Click an audit log entry — "Every round is immutable and auditable"
   - Show SHAP chart — "Bank A finds transaction amount most predictive, Bank B finds time-of-day patterns — without either sharing their data"

4. **Compliance Angle (60s):** Pull up the Compliance Panel — map each component to DPDP Act / GDPR article. "We didn't just build an ML system. We built a compliant one."

5. **Results (30s):** "92% AUC-ROC on federated fraud detection, ε < 1.0, zero raw data ever left any institution."

6. **Close:** "FedGuard: Collaborative intelligence, zero data compromise."

---

## 16. Key Differentiators vs. Competing Teams

| Feature | Basic FL Team | FedGuard (Us) |
|---|---|---|
| Federated Learning | Yes | Yes |
| Differential Privacy | Maybe | Yes, with ε-δ accounting |
| Non-IID data split | Random | Dirichlet(α=0.5) |
| Poisoning Detection | No | Yes, cosine similarity filter |
| Personalized FL (FedProx) | No | Yes |
| Live Dashboard | Terminal logs | Yes, real-time WebSocket UI |
| Audit Log | No | Yes, SQLite immutable |
| SHAP Explainability | No | Yes, per bank |
| Compliance Mapping | No | Yes, DPDP / GDPR panel |
| DataFlow Animation | No | Yes, Framer Motion |

---

## 17. Resources & References

- Flower (flwr) Docs: https://flower.ai/docs/
- Opacus DP Docs: https://opacus.ai/
- Kaggle Credit Card Fraud Dataset: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- FedAvg Paper: https://arxiv.org/abs/1602.05629
- FedProx Paper: https://arxiv.org/abs/1812.06127
- India DPDP Act 2023: https://www.meity.gov.in/data-protection-framework
- Differential Privacy Overview: https://machinelearning.apple.com/research/learning-with-privacy-at-scale

---

*Document maintained by: Tanishq | FedGuard — Privacy-Preserving Federated Financial Intelligence*
