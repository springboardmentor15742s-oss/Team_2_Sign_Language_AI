from pathlib import Path
import os

import cv2
import joblib
import numpy as np
from skimage.feature import hog


# ==========================================================
# MODEL CONFIGURATION
# ==========================================================

BACKEND_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = Path(
    os.getenv(
        "SIGNSPEAK_MODEL_DIR",
        str(BACKEND_ROOT / "models"),
    )
)

MODEL_PATH = MODEL_DIR / "hog_linear_svm.joblib"
ENCODER_PATH = MODEL_DIR / "label_encoder.joblib"


if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"ML model not found: {MODEL_PATH}"
    )

if not ENCODER_PATH.exists():
    raise FileNotFoundError(
        f"Label encoder not found: {ENCODER_PATH}"
    )


model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)


# ==========================================================
# IMAGE DECODING
# ==========================================================

def decode_image(image_bytes: bytes) -> np.ndarray:
    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8,
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise ValueError(
            "Invalid or unreadable image"
        )

    return image


# ==========================================================
# HOG FEATURE EXTRACTION
#
# IMPORTANT:
# Keep this preprocessing compatible with the model's
# existing training pipeline.
# ==========================================================

def extract_hog_features_from_image(
    image: np.ndarray,
) -> np.ndarray:

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB,
    )

    image = cv2.resize(
        image,
        (128, 128),
        interpolation=cv2.INTER_AREA,
    )

    image_gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY,
    )

    features = hog(
        image_gray,
        orientations=9,
        pixels_per_cell=(8, 8),
        cells_per_block=(2, 2),
        block_norm="L2-Hys",
        visualize=False,
        feature_vector=True,
    )

    return features.astype(np.float32)


def extract_hog_features(
    image_bytes: bytes,
) -> np.ndarray:

    image = decode_image(image_bytes)

    return extract_hog_features_from_image(
        image
    )


# ==========================================================
# DECISION SCORE HELPERS
# ==========================================================

def get_ranked_predictions(
    features: np.ndarray,
):
    scores = np.asarray(
        model.decision_function(features)
    )

    if scores.ndim == 1:
        scores = scores.reshape(1, -1)

    row = scores[0]

    ranked = np.argsort(row)[::-1]

    best_index = int(ranked[0])

    second_index = (
        int(ranked[1])
        if len(ranked) > 1
        else best_index
    )

    best_score = float(row[best_index])

    second_score = float(row[second_index])

    margin = best_score - second_score

    return (
        best_index,
        second_index,
        best_score,
        second_score,
        margin,
    )


# ==========================================================
# CONFIDENCE ESTIMATE
#
# This is deliberately called an estimate.
# LinearSVC decision_function is not probability.
# We use the separation between first and second class
# instead of treating the raw maximum score as probability.
# ==========================================================

def confidence_from_margin(
    margin: float,
) -> float:

    confidence = (
        100.0
        / (
            1.0
            + np.exp(
                -2.0 * (margin - 0.35)
            )
        )
    )

    return float(
        np.clip(
            confidence,
            0.0,
            99.0,
        )
    )


# ==========================================================
# PREDICTION
# ==========================================================

def predict_sign(image_bytes: bytes) -> dict:

    features = extract_hog_features(
        image_bytes
    ).reshape(1, -1)

    (
        best_index,
        second_index,
        best_score,
        second_score,
        margin,
    ) = get_ranked_predictions(
        features
    )

    classes = np.asarray(model.classes_)

    best_class = classes[best_index]
    second_class = classes[second_index]

    predicted_sign = (
        label_encoder.inverse_transform(
            [best_class]
        )[0]
    )

    second_sign = (
        label_encoder.inverse_transform(
            [second_class]
        )[0]
    )

    confidence = confidence_from_margin(
        margin
    )

    # Conservative uncertainty handling.
    # This prevents weak webcam predictions from being
    # presented as confident recognition.
    uncertain = (
        margin < 0.20
        or confidence < 55.0
    )

    return {
        "predicted_sign": str(
            predicted_sign
        ).upper(),

        "confidence": round(
            confidence,
            2,
        ),

        "uncertain": bool(
            uncertain
        ),

        "alternative_sign": str(
            second_sign
        ).upper(),

        "decision_margin": round(
            float(margin),
            4,
        ),

        "model_type":
            "HOG + Linear SVM",
    }
