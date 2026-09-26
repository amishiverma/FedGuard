@echo off
echo ========================================================
echo Initializing FedGuard Environment...
echo ========================================================
echo.

if not exist .venv (
    echo [1/5] Creating Python virtual environment...
    python -m venv .venv
) else (
    echo [1/5] Virtual environment already exists.
)

echo [2/5] Activating virtual environment...
call .\.venv\Scripts\activate

echo [3/5] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [4/5] Running Data Splitter (Non-IID Partitioning)...
:: Note: The script is located in data/scripts/ based on the active project structure
python data/scripts/non_iid_split.py

echo [5/5] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ========================================================
echo ✅ Setup Complete! You can now run run_fedguard.bat
echo ========================================================
pause
