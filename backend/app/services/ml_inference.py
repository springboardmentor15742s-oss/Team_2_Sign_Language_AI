from pathlib import Path
import os

import cv2
import joblib
import numpy as np
from skimage.feature import hog


# ==========================================================
# MODEL PATH CONFIGURATION
# ==========================================================

BACKEND_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_MODEL_DIR = BACKEND_ROOT / "models"

MODEL_DIR = Path(
    os.getenv(
        "SIGNSPEAK_MODEL_DIR",
        str(DEFAULT_MODEL_DIR)
    )
)

MODEL_PATH = MODEL_DIR / "hog_linear_svm.joblib"
ENCODER_PATH = MODEL_DIR / "label_encoder.joblib"


# ==========================================================
# VALIDATE MODEL FILES
# ==========================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"ML model not found: {MODEL_PATH}"
    )

if not ENCODER_PATH.exists():
    raise FileNotFoundError(
        f"Label encoder not found: {ENCODER_PATH}"
    )


# ==========================================================
# LOAD MODEL
# ==========================================================

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)


# ==========================================================
# FEATURE EXTRACTION
# ==========================================================

def extract_hog_features(image_bytes: bytes) -> np.ndarray:

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError(
            "Invalid or unreadable image"
        )

    # Same preprocessing used during training
    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    image = cv2.resize(
        image,
        (128, 128)
    )

    image_gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
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

    return features.astype(
        np.float32
    )


# ==========================================================
# PREDICTION
# ==========================================================

def predict_sign(image_bytes: bytes) -> dict:

    features = extract_hog_features(
        image_bytes
    )

    features = features.reshape(
        1,
        -1
    )

    predicted_id = model.predict(
        features
    )[0]

    predicted_sign = (
        label_encoder.inverse_transform(
            [predicted_id]
        )[0]
    )

    # Linear SVM does not provide predict_proba.
    # Decision score is converted to a bounded
    # confidence estimate for the application.
    decision_scores = (
        model.decision_function(
            features
        )
    )

    best_score = float(
        np.max(
            decision_scores
        )
    )

    confidence = 1 / (
        1 + np.exp(
            -best_score
        )
    )

    return {
        "predicted_sign": str(
            predicted_sign
        ),
        "confidence": round(
            float(confidence) * 100,
            2
        ),
    }