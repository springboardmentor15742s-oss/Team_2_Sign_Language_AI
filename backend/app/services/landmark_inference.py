from pathlib import Path

import joblib
import numpy as np


BACKEND_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BACKEND_ROOT
    / "models"
    / "landmark_random_forest.joblib"
)

ENCODER_PATH = (
    BACKEND_ROOT
    / "models"
    / "landmark_label_encoder.joblib"
)


# ==========================================================
# LAZY-CACHED MODEL LOADING
# ==========================================================

_cached_model = None
_cached_encoder = None


def landmark_model_available() -> bool:
    return (
        MODEL_PATH.exists()
        and ENCODER_PATH.exists()
    )


def _load_model():
    global _cached_model, _cached_encoder

    if _cached_model is not None and _cached_encoder is not None:
        return _cached_model, _cached_encoder

    if not landmark_model_available():
        raise FileNotFoundError(
            "Landmark model has not been trained yet."
        )

    _cached_model = joblib.load(MODEL_PATH)
    _cached_encoder = joblib.load(ENCODER_PATH)

    return _cached_model, _cached_encoder


def predict_landmarks(features: list[float]) -> dict:
    if len(features) != 63:
        raise ValueError(
            "Expected exactly 63 landmark features."
        )

    model, encoder = _load_model()

    x = np.asarray(
        features,
        dtype=np.float32,
    ).reshape(1, -1)

    probabilities = model.predict_proba(x)[0]

    ranked = np.argsort(probabilities)[::-1]

    best_index = int(ranked[0])

    second_index = (
        int(ranked[1])
        if len(ranked) > 1
        else best_index
    )

    best_encoded = model.classes_[best_index]
    second_encoded = model.classes_[second_index]

    predicted_sign = encoder.inverse_transform(
        [best_encoded]
    )[0]

    alternative_sign = encoder.inverse_transform(
        [second_encoded]
    )[0]

    confidence = float(
        probabilities[best_index] * 100
    )

    second_confidence = float(
        probabilities[second_index] * 100
    )

    margin = confidence - second_confidence

    uncertain = (
        confidence < 60
        or margin < 15
    )

    return {
        "predicted_sign": str(predicted_sign).upper(),
        "confidence": round(confidence, 2),
        "uncertain": bool(uncertain),
        "alternative_sign": str(alternative_sign).upper(),
        "decision_margin": round(margin, 2),
        "model_type": "MediaPipe Landmarks + Random Forest",
    }
