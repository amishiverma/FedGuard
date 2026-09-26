"""
Federated Learning Training & Evaluation Engine
================================================
Production-grade PyTorch Dataset, Training, and Evaluation pipeline
tailored for tabular credit card fraud detection under extreme class imbalance.
"""
from engine import TabularFraudDataset, train, test

__all__ = ["TabularFraudDataset", "train", "test"]
