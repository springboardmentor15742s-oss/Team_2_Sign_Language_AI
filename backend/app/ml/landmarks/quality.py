"""
Frame & hand quality validation gate.

Runs *before* classification so that low-quality camera input (too dark, hand
too small/large, hand partially outside the frame, unreliable detection) is
rejected with an actionable message instead of being silently classified and
scored. The classifier only ever sees landmark-derived numeric features (not
raw pixels), so background/person pixels cannot themselves be "classified as
the sign" -- but a badly framed or ambiguous hand can still produce a
low-quality landmark set that would otherwise be scored misleadingly. This
module is the explicit gate that prevents that.
"""
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class QualityIssue:
    code: str
    message: str
    severity: str = "error"  # "error" blocks scoring, "warning" is informational only

    def to_dict(self) -> Dict[str, Any]:
        return {"code": self.code, "message": self.message, "severity": self.severity}


@dataclass
class QualityReport:
    passed: bool = True
    issues: List[QualityIssue] = field(default_factory=list)
    brightness: float = 0.0
    hand_bbox_area_ratio: float = 0.0
    hand_center: Optional[List[float]] = None
    detection_confidence: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "issues": [i.to_dict() for i in self.issues],
            "brightness": self.brightness,
            "hand_bbox_area_ratio": self.hand_bbox_area_ratio,
            "hand_center": self.hand_center,
            "detection_confidence": self.detection_confidence,
        }


class FrameQualityValidator:
    """
    Validates hand visibility/positioning and frame lighting from raw
    (pre-normalization) landmark coordinates and the source image.
    """

    MIN_BRIGHTNESS = 35.0        # mean 0-255 grayscale value
    MIN_BBOX_AREA_RATIO = 0.012  # hand occupies too little of the frame -> too far
    MAX_BBOX_AREA_RATIO = 0.92   # hand occupies too much of the frame -> too close
    EDGE_MARGIN = 0.02           # normalized distance from frame edge considered "at the edge"
    MIN_DETECTION_CONFIDENCE = 0.35

    def evaluate_brightness(self, img_rgb: Optional[np.ndarray]) -> Optional[float]:
        if img_rgb is None:
            return None
        try:
            return float(np.mean(img_rgb.astype(np.float32)))
        except Exception as e:
            logger.warning(f"Brightness computation failed: {e}")
            return None

    def evaluate(
        self,
        img_rgb: Optional[np.ndarray],
        raw_landmarks: Optional[List[List[float]]],
        detection_confidence: float = 0.0,
    ) -> QualityReport:
        report = QualityReport(detection_confidence=round(float(detection_confidence), 4))
        issues: List[QualityIssue] = []

        brightness = self.evaluate_brightness(img_rgb)
        if brightness is not None:
            report.brightness = round(brightness, 1)
            if brightness < self.MIN_BRIGHTNESS:
                issues.append(QualityIssue(
                    "low_light",
                    "Lighting is too low for reliable hand detection. Face a light source or brighten the room.",
                    "error",
                ))

        if not raw_landmarks or len(raw_landmarks) < 21:
            issues.append(QualityIssue(
                "insufficient_landmarks",
                "Not enough hand landmarks were detected. Make sure your entire hand is visible.",
                "error",
            ))
            report.issues = issues
            report.passed = not any(i.severity == "error" for i in issues)
            return report

        xs = [p[0] for p in raw_landmarks]
        ys = [p[1] for p in raw_landmarks]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        bbox_w = max(max_x - min_x, 0.0)
        bbox_h = max(max_y - min_y, 0.0)
        area_ratio = bbox_w * bbox_h
        report.hand_bbox_area_ratio = round(float(area_ratio), 4)
        report.hand_center = [round(float((min_x + max_x) / 2), 4), round(float((min_y + max_y) / 2), 4)]

        out_of_frame = min_x < -self.EDGE_MARGIN or min_y < -self.EDGE_MARGIN \
            or max_x > 1 + self.EDGE_MARGIN or max_y > 1 + self.EDGE_MARGIN
        near_edge = (not out_of_frame) and (
            min_x < self.EDGE_MARGIN or min_y < self.EDGE_MARGIN
            or max_x > 1 - self.EDGE_MARGIN or max_y > 1 - self.EDGE_MARGIN
        )

        if out_of_frame:
            direction = []
            if min_x < -self.EDGE_MARGIN:
                direction.append("right")  # webcam preview is mirrored for the user
            if max_x > 1 + self.EDGE_MARGIN:
                direction.append("left")
            if min_y < -self.EDGE_MARGIN:
                direction.append("down")
            if max_y > 1 + self.EDGE_MARGIN:
                direction.append("up")
            hint = f" Move it {', '.join(direction)}." if direction else ""
            issues.append(QualityIssue(
                "hand_out_of_frame",
                f"Your hand is partially outside the camera frame.{hint} Center it and try again.",
                "error",
            ))
        elif near_edge:
            issues.append(QualityIssue(
                "hand_near_edge",
                "Move your hand slightly toward the center of the frame.",
                "warning",
            ))

        if area_ratio < self.MIN_BBOX_AREA_RATIO:
            issues.append(QualityIssue(
                "hand_too_far",
                "Your hand appears too small in the frame. Move closer to the camera.",
                "error",
            ))
        elif area_ratio > self.MAX_BBOX_AREA_RATIO:
            issues.append(QualityIssue(
                "hand_too_close",
                "Your hand is too close to the camera. Move back slightly so your whole hand is visible.",
                "error",
            ))

        if detection_confidence and detection_confidence < self.MIN_DETECTION_CONFIDENCE:
            issues.append(QualityIssue(
                "low_detection_confidence",
                "Hand detection confidence is low. Keep your hand steady and clearly visible.",
                "warning",
            ))

        report.issues = issues
        report.passed = not any(i.severity == "error" for i in issues)
        return report
