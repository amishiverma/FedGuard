@echo off
echo ========================================================
echo 🚀 FEDGUARD: ONE-CLICK STARTUP SEQUENCE INITIATED
echo ========================================================
echo.

echo [1/6] Starting FastAPI Backend Bridge...
start "FedGuard API (Vrinda)" cmd /k ".\.venv\Scripts\activate & uvicorn backend.api.main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

echo [2/6] Starting Next.js Frontend Dashboard...
start "FedGuard UI (Amishi)" cmd /k "cd frontend & npm run dev"
timeout /t 3 /nobreak >nul

echo [3/6] Starting Flower Master Server...
start "FL Server (Yash)" cmd /k ".\.venv\Scripts\activate & python backend/fl_server/server.py"
timeout /t 3 /nobreak >nul

echo [4/6] Connecting Bank A (HDFC)...
start "Bank A - HDFC" cmd /k ".\.venv\Scripts\activate & python clients/core/client.py --bank bank_a"
timeout /t 1 /nobreak >nul

echo [5/6] Connecting Bank B (ICICI)...
start "Bank B - ICICI" cmd /k ".\.venv\Scripts\activate & python clients/core/client.py --bank bank_b"
timeout /t 1 /nobreak >nul

echo [6/6] Connecting FinTech C (PhonePe)...
start "Bank C - PhonePe" cmd /k ".\.venv\Scripts\activate & python clients/core/client.py --bank bank_c"

echo.
echo ========================================================
echo ✅ ALL SYSTEMS GO! TRAINING HAS INITIATED.
echo.
echo Dashboard: http://localhost:3000
echo Thin-File API (X-Factor): http://localhost:8000/docs
echo ========================================================
pause