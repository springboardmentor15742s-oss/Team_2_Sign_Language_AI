import numpy as np

from app.ml.landmarks.quality import FrameQualityValidator


def _centered_landmarks(size=0.3):
    """21 landmarks forming a small, centered, plausible hand bounding box."""
    base = 0.5 - size / 2
    return [[base + (i % 5) * (size / 5), base + (i // 5) * (size / 5), 0.0] for i in range(21)]


def test_quality_passes_for_well_framed_hand():
    validator = FrameQualityValidator()
    bright_img = np.full((100, 100, 3), 180, dtype=np.uint8)
    report = validator.evaluate(bright_img, _centered_landmarks(), detection_confidence=0.9)
    assert report.passed is True
    assert report.issues == [] or all(i.severity == "warning" for i in report.issues)


def test_quality_flags_low_light():
    validator = FrameQualityValidator()
    dark_img = np.full((100, 100, 3), 5, dtype=np.uint8)
    report = validator.evaluate(dark_img, _centered_landmarks(), detection_confidence=0.9)
    assert report.passed is False
    assert any(i.code == "low_light" for i in report.issues)


def test_quality_flags_hand_too_far():
    validator = FrameQualityValidator()
    bright_img = np.full((100, 100, 3), 180, dtype=np.uint8)
    tiny_hand = _centered_landmarks(size=0.02)
    report = validator.evaluate(bright_img, tiny_hand, detection_confidence=0.9)
    assert report.passed is False
    assert any(i.code == "hand_too_far" for i in report.issues)


def test_quality_flags_hand_out_of_frame():
    validator = FrameQualityValidator()
    bright_img = np.full((100, 100, 3), 180, dtype=np.uint8)
    out_of_frame = [[-0.3 + i * 0.01, 0.5, 0.0] for i in range(21)]
    report = validator.evaluate(bright_img, out_of_frame, detection_confidence=0.9)
    assert report.passed is False
    assert any(i.code == "hand_out_of_frame" for i in report.issues)


def test_quality_flags_insufficient_landmarks():
    validator = FrameQualityValidator()
    bright_img = np.full((100, 100, 3), 180, dtype=np.uint8)
    report = validator.evaluate(bright_img, [[0.5, 0.5, 0.0]] * 5, detection_confidence=0.9)
    assert report.passed is False
    assert any(i.code == "insufficient_landmarks" for i in report.issues)
