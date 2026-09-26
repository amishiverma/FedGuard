import logging

logger = logging.getLogger("fedguard-shap")

# Feature set matching the fraud detection model trained on Kaggle tabular data
_SHAP_VALUES: dict[str, dict] = {
    "bank_a": {
        "bank_id": "bank_a",
        "bank_name": "Bank A (HDFC Simulation)",
        "model_version": "FedGuard-v1.0-Round10",
        "features": {
            "Transaction_Amount":         0.412,
            "Location_Mismatch":          0.287,
            "Velocity_of_Transactions":   0.198,
            "Device_Type":                0.063,
            "Hour_of_Transaction":        0.024,
            "Is_International":           0.016,
        },
        "top_feature": "Transaction_Amount",
        "note": "High-value transaction amounts dominate fraud signals for this bank.",
    },
    "bank_b": {
        "bank_id": "bank_b",
        "bank_name": "Bank B (SBI Simulation)",
        "model_version": "FedGuard-v1.0-Round10",
        "features": {
            "Transaction_Amount":         0.198,
            "Location_Mismatch":          0.381,
            "Velocity_of_Transactions":   0.241,
            "Device_Type":                0.091,
            "Hour_of_Transaction":        0.062,
            "Is_International":           0.027,
        },
        "top_feature": "Location_Mismatch",
        "note": "Geographic anomalies are the strongest fraud predictor for this bank.",
    },
    "bank_c": {
        "bank_id": "bank_c",
        "bank_name": "Bank C (ICICI Simulation)",
        "model_version": "FedGuard-v1.0-Round10",
        "features": {
            "Transaction_Amount":         0.231,
            "Location_Mismatch":          0.176,
            "Velocity_of_Transactions":   0.354,
            "Device_Type":                0.142,
            "Hour_of_Transaction":        0.071,
            "Is_International":           0.026,
        },
        "top_feature": "Velocity_of_Transactions",
        "note": "Rapid consecutive transactions are the strongest fraud signal for this bank.",
    },
}


def get_mock_shap_values(bank_id: str) -> dict:
    """
    Returns mock SHAP feature importance values for the local fraud detection model
    at the given bank. Values differ per bank to simulate personalized local models
    trained via Non-IID Dirichlet-split data.
    All computation is local — no raw data leaves the bank perimeter.
    """
    return _SHAP_VALUES[bank_id]
