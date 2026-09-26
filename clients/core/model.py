"""
Re-export FraudDetectionModel and utilities for clients.core package.
"""
from model import (
    FraudDetectionModel,
    get_device,
    get_model_parameters,
    set_model_parameters,
)

__all__ = [
    "FraudDetectionModel",
    "get_device",
    "get_model_parameters",
    "set_model_parameters",
]
