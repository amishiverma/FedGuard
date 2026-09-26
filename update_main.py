import os

filepath = 'backend/api/main.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SQLite
content = content.replace(
    '''        con = sqlite3.connect(AUDIT_DB)
        con.row_factory = sqlite3.Row''',
    '''        con = sqlite3.connect(AUDIT_DB, timeout=10.0)
        con.execute("PRAGMA journal_mode=WAL;")
        con.row_factory = sqlite3.Row'''
)

# 2. Add SIMULATION_MODE
content = content.replace(
    '''manager = ConnectionManager()

async def simulate_training():''',
    '''manager = ConnectionManager()

SIMULATION_MODE = False

async def simulate_training():'''
)

# 3. Update simulate_training
content = content.replace(
    '''        try:
            if training_state["is_training"]:''',
    '''        try:
            if SIMULATION_MODE and training_state["is_training"]:'''
)

# 4. Extract poll_audit_db_loop and lifespan
old_lifespan = '''@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the simulation background loop
    task = asyncio.create_task(simulate_training())
    yield
    task.cancel()'''
new_lifespan = '''async def poll_audit_db_loop():
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
    poll_task.cancel()'''
content = content.replace(old_lifespan, new_lifespan)


# 5. Replace websocket_metrics
import re
ws_pattern = re.compile(r'@app\.websocket\("/ws/metrics"\).*?(?=@app\.post\("/api/start-training")', re.DOTALL)
new_ws = '''@app.websocket("/ws/metrics")
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

'''
content = ws_pattern.sub(new_ws, content)


# 6. Replace start_training
start_pattern = re.compile(r'@app\.post\("/api/start-training".*?(?=@app\.post\("/api/webhook/metrics")', re.DOTALL)
new_start = '''@app.post("/api/start-training", summary="Trigger Federated Training")
async def start_training():
    """
    Training must be manually started via terminals to prevent gRPC/HTTP collisions.
    """
    training_state["is_training"] = True
    return {
        "status": "listening",
        "message": "Start clients in terminals to begin training"
    }

'''
content = start_pattern.sub(new_start, content)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated main.py successfully!")
