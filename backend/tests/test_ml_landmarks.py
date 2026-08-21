import numpy as np
import pytest

from app.ml.landmarks.normalizer import LandmarkNormalizer
from app.ml.landmarks.extractor import LandmarkVectorExtractor


def test_landmark_normalizer_valid():
    normalizer = LandmarkNormalizer()
    raw_landmarks = [[float(i), float(i * 2), 0.0] for i in range(21)]
    normalized, meta = normalizer.normalize(raw_landmarks)

    assert meta["is_valid"] is True
    assert normalized.shape == (21, 3)
    # Wrist (index 0) should be translated to [0, 0, 0]
    np.testing.assert_allclose(normalized[0], [0.0, 0.0, 0.0], atol=1e-5)


def test_landmark_normalizer_empty():
    normalizer = LandmarkNormalizer()
    normalized, meta = normalizer.normalize([])

    assert meta["is_valid"] is False
    assert normalized.shape == (21, 3)


def test_landmark_normalizer_zero_scale():
    normalizer = LandmarkNormalizer()
    raw_landmarks = [[0.0, 0.0, 0.0] for _ in range(21)]
    normalized, meta = normalizer.normalize(raw_landmarks)

    assert meta["is_valid"] is True
    assert not np.isnan(normalized).any()
    assert not np.isinf(normalized).any()


def test_landmark_vector_extractor():
    extractor = LandmarkVectorExtractor()
    raw_landmarks = [[float(i), float(i), 0.1] for i in range(21)]

    res = extractor.extract_landmarks({"landmarks": raw_landmarks, "confidence": 0.95})
    assert res.hand_detected is True
    assert res.confidence == 0.95
    assert len(res.landmarks) == 21
