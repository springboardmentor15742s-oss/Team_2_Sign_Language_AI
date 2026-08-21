from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import numpy as np


@dataclass
class SignPredictionResult:
    predicted_sign: str = "unknown"
    confidence: float = 0.0
    top_predictions: List[Dict[str, Any]] = field(default_factory=list)
    model_version: str = "v1.0.0"
    is_trained: bool = True
    error_message: Optional[str] = None


class SignAssessmentModel(ABC):
    """
    Abstract interface for sign language recognition classification models.
    """

    @property
    @abstractmethod
    def is_trained(self) -> bool:
        pass

    @abstractmethod
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        pass

    @abstractmethod
    def predict(self, features: np.ndarray, top_k: int = 3) -> SignPredictionResult:
        pass

    @abstractmethod
    def save_model(self, path: Any) -> bool:
        pass

    @abstractmethod
    def load_model(self, path: Any) -> bool:
        pass
