import numpy as np
import pytest

from app.ml.features.extractor import FeatureExtractor


def test_feature_extractor_shape():
    extractor = FeatureExtractor()
    landmarks = [[float(i * 0.1), float(i * 0.05), float(i * 0.01)] for i in range(21)]

    vec = extractor.extract_features(landmarks)
    assert isinstance(vec, np.ndarray)
    assert vec.ndim == 1
    assert vec.shape[0] == 82
    assert not np.isnan(vec).any()


def test_feature_extractor_deterministic():
    extractor = FeatureExtractor()
    landmarks = [[float(i * 0.1), float(i * 0.05), float(i * 0.01)] for i in range(21)]

    vec1 = extractor.extract_features(landmarks)
    vec2 = extractor.extract_features(landmarks)

    np.testing.assert_array_equal(vec1, vec2)
