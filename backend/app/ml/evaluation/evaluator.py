import logging
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import numpy as np

from app.ml.models.base import SignAssessmentModel, SignPredictionResult
from app.ml.evaluation.metrics import EvaluationMetricsCalculator
from app.ml.dataset.config import ASL_CLASSES

logger = logging.getLogger(__name__)


@dataclass
class EvaluationReport:
    dataset_name: str = "ASL Alphabet Test Set"
    model_name: str = "RandomForestSignClassifier"
    model_version: str = "v1.0.0-rf"
    total_samples: int = 0
    test_samples: int = 0
    correct_predictions: int = 0
    incorrect_predictions: int = 0
    accuracy: float = 0.0
    precision_macro: float = 0.0
    precision_weighted: float = 0.0
    recall_macro: float = 0.0
    recall_weighted: float = 0.0
    f1_macro: float = 0.0
    f1_weighted: float = 0.0
    per_class_metrics: Dict[str, Any] = field(default_factory=dict)
    confusion_matrix: List[List[int]] = field(default_factory=list)
    classes: List[str] = field(default_factory=lambda: ASL_CLASSES)
    error_message: Optional[str] = None
    feature_count: int = 0
    train_samples: int = 0
    val_samples: int = 0
    evaluated_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_name": self.dataset_name,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "total_samples": self.total_samples,
            "test_samples": self.test_samples or self.total_samples,
            "correct_predictions": self.correct_predictions,
            "incorrect_predictions": self.incorrect_predictions,
            "accuracy": self.accuracy,
            "precision_macro": self.precision_macro,
            "precision_weighted": self.precision_weighted,
            "recall_macro": self.recall_macro,
            "recall_weighted": self.recall_weighted,
            "f1_macro": self.f1_macro,
            "f1_weighted": self.f1_weighted,
            "per_class_metrics": self.per_class_metrics,
            "confusion_matrix": self.confusion_matrix,
            "classes": self.classes,
            "error_message": self.error_message,
            "feature_count": self.feature_count,
            "train_samples": self.train_samples,
            "val_samples": self.val_samples,
            "evaluated_at": self.evaluated_at,
        }


class ModelEvaluator:
    """
    Runs model evaluation against labeled feature test matrices.
    """

    def __init__(self, model: SignAssessmentModel):
        self.model = model
        self.metrics_calculator = EvaluationMetricsCalculator()

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> EvaluationReport:
        if not self.model.is_trained:
            return EvaluationReport(
                error_message="Cannot evaluate model: Model is not trained."
            )

        if len(X_test) == 0 or len(y_test) == 0:
            return EvaluationReport(
                error_message="Cannot evaluate model: Test dataset is empty."
            )

        logger.info(f"Evaluating model on {len(X_test)} test samples...")

        y_preds = []
        confidences = []

        for sample in X_test:
            pred_res: SignPredictionResult = self.model.predict(sample)
            y_preds.append(pred_res.predicted_sign)
            confidences.append(pred_res.confidence)

        metrics = self.metrics_calculator.compute_all_metrics(
            y_true=y_test,
            y_pred=y_preds,
            confidences=confidences,
            classes=ASL_CLASSES,
        )

        total_samples = metrics["total_samples"]
        acc = metrics["accuracy"]
        correct_count = int(round(acc * total_samples))
        incorrect_count = total_samples - correct_count

        return EvaluationReport(
            dataset_name="ASL Alphabet Test Set",
            model_name="RandomForestSignClassifier",
            model_version=getattr(self.model, "model_version", "v1.0.0-rf"),
            total_samples=total_samples,
            test_samples=total_samples,
            correct_predictions=correct_count,
            incorrect_predictions=incorrect_count,
            accuracy=metrics["accuracy"],
            precision_macro=metrics["precision_macro"],
            precision_weighted=metrics["precision_weighted"],
            recall_macro=metrics["recall_macro"],
            recall_weighted=metrics["recall_weighted"],
            f1_macro=metrics["f1_macro"],
            f1_weighted=metrics["f1_weighted"],
            per_class_metrics=metrics["per_class_metrics"],
            confusion_matrix=metrics["confusion_matrix"],
            classes=ASL_CLASSES,
        )
