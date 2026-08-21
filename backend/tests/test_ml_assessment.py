import numpy as np
import pytest

from app.ml.assessment.scoring import ScoringEngine
from app.ml.assessment.service import SignAssessmentService
from app.ml.models.sign_classifier import RandomForestSignClassifier


def test_scoring_engine():
    engine = ScoringEngine()

    res_correct = engine.calculate_score("A", "A", confidence=0.90)
    assert res_correct["is_correct"] is True
    assert res_correct["score"] > 60.0

    res_incorrect = engine.calculate_score("A", "B", confidence=0.90)
    assert res_incorrect["is_correct"] is False
    assert res_incorrect["score"] < 60.0


def test_assessment_service_no_hand(tmp_path):
    model_file = tmp_path / "model.joblib"
    clf = RandomForestSignClassifier(model_path=model_file)
    service = SignAssessmentService(classifier=clf)

    res = service.evaluate_sign("A", [])
    assert res.hand_detected is False
    assert res.status == "no_hand"
    assert "not detected" in res.feedback.lower()


def test_assessment_service_with_model(tmp_path):
    model_file = tmp_path / "model.joblib"
    clf = RandomForestSignClassifier(model_path=model_file)

    # Train dummy model
    X_train = np.random.randn(20, 82).astype(np.float32)
    y_train = np.array(["A"] * 10 + ["B"] * 10)
    clf.train(X_train, y_train)

    service = SignAssessmentService(classifier=clf)
    sample_landmarks = [[float(i * 0.05), float(i * 0.02), 0.0] for i in range(21)]

    res = service.evaluate_sign("A", sample_landmarks)
    assert res.hand_detected is True
    assert res.status in {"success", "low_confidence"}
    assert res.expected_sign == "A"
    assert res.predicted_sign in {"A", "B"}
    assert 0.0 <= res.score <= 100.0
    assert len(res.feedback) > 0
