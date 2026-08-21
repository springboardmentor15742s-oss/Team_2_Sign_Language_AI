import numpy as np
import pytest

from app.ml.evaluation.metrics import EvaluationMetricsCalculator
from app.ml.evaluation.evaluator import ModelEvaluator
from app.ml.models.sign_classifier import RandomForestSignClassifier


def test_evaluation_metrics_calculator():
    calc = EvaluationMetricsCalculator()

    y_true = ["A", "A", "B", "B", "C"]
    y_pred = ["A", "A", "B", "C", "C"]

    res = calc.compute_all_metrics(y_true, y_pred, classes=["A", "B", "C"])

    assert res["total_samples"] == 5
    assert res["accuracy"] == 0.8  # 4 / 5 = 0.8
    assert "precision_macro" in res
    assert "recall_macro" in res
    assert "f1_macro" in res
    assert "confusion_matrix" in res
    assert len(res["per_class_metrics"]) == 3


def test_model_evaluator_untrained(tmp_path):
    clf = RandomForestSignClassifier(model_path=tmp_path / "model.joblib")
    evaluator = ModelEvaluator(clf)

    X_test = np.zeros((5, 82), dtype=np.float32)
    y_test = np.array(["A", "B", "C", "A", "B"])

    report = evaluator.evaluate(X_test, y_test)
    assert report.error_message is not None
    assert "Model is not trained" in report.error_message
