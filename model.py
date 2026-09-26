"""
FedGuard - Root model re-export
================================
Provides FraudDetectionModel, TabularNet, and weight serialization utilities.
"""

from model_scripts.model import (
    FraudDetectionModel,
    get_device,
    get_model_parameters,
    set_model_parameters,
)

# TabularNet alias
TabularNet = FraudDetectionModel

__all__ = [
    "FraudDetectionModel",
    "TabularNet",
    "get_device",
    "get_model_parameters",
    "set_model_parameters",
]
