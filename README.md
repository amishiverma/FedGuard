# 🛡️ Federated Learning for Cross-Institution Financial Risk Control
**ENIGMA 5.0 - Fintech Track**

## 📖 Problem Statement
Financial institutions are siloed. Due to strict data privacy regulations (like India's DPDP Act), banks cannot share raw customer data with each other. This results in weak fraud detection models and poor credit decisions for thin-file customers. 

## 🚀 Our Solution
We implement a **Privacy-Preserving Federated Learning Network**. 
Instead of centralizing data, we decentralize the AI. Multiple financial institutions train a shared global model on their local, secure data. Only mathematically encrypted model updates (gradients) are shared with the central server, ensuring zero raw data leakage.

### ✨ Key Features
*   **Decentralized Training:** Uses `flwr` (Flower) to train across distributed nodes (simulating Bank A, B, and C).
*   **Differential Privacy:** Integrated with `Opacus` to add cryptographic noise to model weights, preventing reverse-engineering of customer data.
*   **Live Dashboard:** A real-time Next.js monitoring dashboard receiving training metrics via FastAPI WebSockets.

## 🏗️ Tech Stack
*   **Federated Learning:** Flower (`flwr`)
*   **Machine Learning:** PyTorch
*   **Privacy Engine:** Opacus (Differential Privacy)
*   **Backend & Websockets:** FastAPI, Python
*   **Frontend UI:** Next.js, Tailwind CSS, Recharts

## 📁 Repository Structure
```text
.
├── backend/            # FastAPI central server & Flower global model aggregator
├── clients/            # Local training scripts for Bank A, B, and C
├── frontend/           # Next.js real-time monitoring dashboard
├── data/               # Local datasets (IGNORED IN GIT FOR PRIVACY)
├── notebooks/          # Jupyter notebooks for initial EDA and model testing
├── requirements.txt    # Python dependencies
└── README.md           
```

## 🛠️ Quick Start (Development)

### 1. Setup Python Environment (Backend & Clients)
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

### 2. Run the Central Aggregator Server
```bash
cd backend
uvicorn main:app --reload
```

### 3. Run the Bank Clients (in separate terminals)
```bash
python clients/bank_a/client.py
python clients/bank_b/client.py
```

### 4. Run the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
