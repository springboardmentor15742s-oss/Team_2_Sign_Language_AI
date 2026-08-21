import numpy as np
import pytest
from pathlib import Path

from app.ml.models.sign_classifier import RandomForestSignClassifier


def test_classifier_untrained_state(tmp_path):
    model_file = tmp_path / "test_model.joblib"
    classifier = RandomForestSignClassifier(model_path=model_file)

    assert classifier.is_trained is False

    dummy_features = np.zeros(82, dtype=np.float32)
    res = classifier.predict(dummy_features)

    assert res.is_trained is False
    assert res.predicted_sign == "unknown"
    assert res.confidence == 0.0


def test_classifier_train_predict_save_load(tmp_path):
    model_file = tmp_path / "test_model.joblib"
    classifier = RandomForestSignClassifier(model_path=model_file)

    # Synthetic dataset for 3 classes
    X_train = np.random.randn(30, 82).astype(np.float32)
    y_train = np.array(["A"] * 10 + ["B"] * 10 + ["C"] * 10)

    train_res = classifier.train(X_train, y_train)
    assert classifier.is_trained is True
    assert train_res["n_samples"] == 30

    pred_res = classifier.predict(X_train[0])
    assert pred_res.is_trained is True
    assert pred_res.predicted_sign in {"A", "B", "C"}
    assert 0.0 <= pred_res.confidence <= 1.0
    assert len(pred_res.top_predictions) > 0

    saved = classifier.save_model(model_file)
    assert saved is True
    assert model_file.exists()

    # Load into new classifier instance
    new_classifier = RandomForestSignClassifier(model_path=model_file)
    assert new_classifier.is_trained is True
    new_pred = new_classifier.predict(X_train[0])
    assert new_pred.predicted_sign == pred_res.predicted_sign
