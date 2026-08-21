import atexit
import base64
import io
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Tuple, Union, Dict, Any
import numpy as np
from PIL import Image
import cv2

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from app.ml.landmarks.normalizer import LandmarkNormalizer
from app.ml.landmarks.quality import FrameQualityValidator

logger = logging.getLogger(__name__)


@dataclass
class LandmarkResult:
    landmarks: List[List[float]] = field(default_factory=list)
    # Pre-normalization landmarks in the original [0,1] image coordinate
    # space (unlike `landmarks`, which is wrist-centered/scaled for
    # classification) -- for drawing an on-screen skeleton overlay that
    # actually lines up with the video frame.
    raw_landmarks: List[List[float]] = field(default_factory=list)
    hand_detected: bool = False
    confidence: float = 0.0
    handedness: str = "Right"
    raw_shape: Optional[List[int]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseLandmarkExtractor(ABC):
    """
    Abstract interface for hand landmark extraction layers.
    """

    @abstractmethod
    def extract_landmarks(self, input_data: Any) -> LandmarkResult:
        pass


class LandmarkVectorExtractor(BaseLandmarkExtractor):
    """
    Direct landmark extractor for client-supplied 21-point landmark arrays.
    """

    def __init__(self):
        self.normalizer = LandmarkNormalizer()

    def extract_landmarks(self, input_data: Any) -> LandmarkResult:
        if isinstance(input_data, dict) and "landmarks" in input_data:
            raw_landmarks = input_data["landmarks"]
            handedness = input_data.get("handedness", "Right")
            confidence = float(input_data.get("confidence", 0.95))
        elif isinstance(input_data, (list, tuple, np.ndarray)):
            raw_landmarks = input_data
            handedness = "Right"
            confidence = 0.90
        else:
            return LandmarkResult(hand_detected=False, confidence=0.0)

        if not raw_landmarks or len(raw_landmarks) == 0:
            return LandmarkResult(hand_detected=False, confidence=0.0)

        normalized, meta = self.normalizer.normalize(raw_landmarks)
        return LandmarkResult(
            landmarks=normalized.tolist(),
            raw_landmarks=np.array(raw_landmarks, dtype=np.float32).tolist(),
            hand_detected=meta["is_valid"],
            confidence=confidence if meta["is_valid"] else 0.0,
            handedness=handedness,
            metadata=meta,
        )


class MediaPipeLandmarkExtractor(BaseLandmarkExtractor):
    """
    Landmark extractor for images/frames using MediaPipe Tasks HandLandmarker.
    Extracts precise 21 3D hand landmarks per detected hand.
    """

    def __init__(self, model_path: Optional[Union[str, Path]] = None):
        self.normalizer = LandmarkNormalizer()
        self.quality_validator = FrameQualityValidator()
        self.detector = None
        self._init_detector(model_path)

    def _init_detector(self, model_path: Optional[Union[str, Path]] = None):
        task_path = Path(model_path) if model_path else Path("app/ml/saved_models/hand_landmarker.task")
        if task_path.exists():
            try:
                base_options = python.BaseOptions(model_asset_path=str(task_path))
                options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
                self.detector = vision.HandLandmarker.create_from_options(options)
                # MediaPipe's native HandLandmarker owns a background inference
                # thread pool that does not always join on normal interpreter
                # shutdown (observed as a hang after the last test/script line
                # runs). Explicitly close it at process exit.
                atexit.register(self.close)
                logger.info(f"MediaPipe HandLandmarker initialized successfully from {task_path}")
            except Exception as e:
                logger.warning(f"Could not initialize MediaPipe HandLandmarker: {e}")
        else:
            logger.warning(f"MediaPipe hand landmarker asset not found at {task_path}. Will use fallback detector.")

    def close(self) -> None:
        if self.detector is not None:
            try:
                self.detector.close()
            except Exception as e:
                logger.warning(f"Error closing MediaPipe HandLandmarker: {e}")
            finally:
                self.detector = None

    def extract_landmarks(self, input_data: Any) -> LandmarkResult:
        img_np = self._decode_image(input_data)
        if img_np is None:
            return LandmarkResult(hand_detected=False, confidence=0.0)

        h, w, c = img_np.shape
        landmarks_3d, confidence, hand_found = self._detect_hand_keypoints(img_np)

        if not hand_found:
            quality = self.quality_validator.evaluate(img_np, None, 0.0)
            return LandmarkResult(
                hand_detected=False,
                confidence=0.0,
                raw_shape=[h, w, c],
                metadata={"quality": quality.to_dict()},
            )

        quality = self.quality_validator.evaluate(img_np, landmarks_3d, confidence)

        normalized, meta = self.normalizer.normalize(landmarks_3d)
        meta["quality"] = quality.to_dict()
        return LandmarkResult(
            landmarks=normalized.tolist(),
            raw_landmarks=[[float(p[0]), float(p[1]), float(p[2])] for p in landmarks_3d],
            hand_detected=True,
            confidence=confidence,
            handedness="Right",
            raw_shape=[h, w, c],
            metadata=meta,
        )

    def _decode_image(self, input_data: Any) -> Optional[np.ndarray]:
        try:
            if isinstance(input_data, np.ndarray):
                if input_data.ndim == 3:
                    return input_data
                return None

            if isinstance(input_data, Image.Image):
                return np.array(input_data.convert("RGB"))

            if isinstance(input_data, str):
                if "," in input_data:
                    input_data = input_data.split(",")[1]
                img_bytes = base64.b64decode(input_data)
                img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                return np.array(img)
        except Exception as e:
            logger.error(f"Image decoding error: {e}")
            return None
        return None

    def _detect_hand_keypoints(self, img_rgb: np.ndarray) -> Tuple[List[List[float]], float, bool]:
        """
        Uses MediaPipe HandLandmarker for precise 21 3D landmark extraction.
        """
        if self.detector:
            try:
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
                detection_result = self.detector.detect(mp_image)

                if detection_result.hand_landmarks and len(detection_result.hand_landmarks) > 0:
                    hand = detection_result.hand_landmarks[0]
                    landmarks = [[float(lm.x), float(lm.y), float(lm.z)] for lm in hand]

                    confidence = 0.95
                    if detection_result.handedness and len(detection_result.handedness) > 0:
                        confidence = float(detection_result.handedness[0][0].score)

                    return landmarks, round(confidence, 4), True
            except Exception as e:
                logger.error(f"MediaPipe detection error: {e}")

        # Fallback contour detector if MediaPipe misses or is uninitialized
        return self._detect_hand_keypoints_fallback(img_rgb)

    def _detect_hand_keypoints_fallback(self, img_rgb: np.ndarray) -> Tuple[List[List[float]], float, bool]:
        h, w, _ = img_rgb.shape
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return [], 0.0, False

        c = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(c)
        if area < (h * w * 0.02):
            return [], 0.0, False

        x, y, bw, bh = cv2.boundingRect(c)
        M = cv2.moments(c)
        cx = int(M["m10"] / M["m00"]) if M["m00"] != 0 else x + bw // 2
        cy = int(M["m01"] / M["m00"]) if M["m00"] != 0 else y + bh // 2

        wrist = [float(cx / w), float((y + bh) / h), 0.0]
        fingertip_offsets = [
            (-0.35 * bw, 0.1 * bh),
            (-0.25 * bw, -0.45 * bh),
            (0.0 * bw, -0.5 * bh),
            (0.25 * bw, -0.45 * bh),
            (0.35 * bw, -0.35 * bh),
        ]

        landmarks = [wrist]
        for f_idx, (dx, dy) in enumerate(fingertip_offsets):
            tip_x = cx + dx
            tip_y = cy + dy
            for joint_step in [1, 2, 3, 4]:
                frac = joint_step / 4.0
                jx = (cx * (1 - frac) + tip_x * frac) / w
                jy = (cy * (1 - frac) + tip_y * frac) / h
                jz = -0.05 * joint_step
                landmarks.append([float(np.clip(jx, 0, 1)), float(np.clip(jy, 0, 1)), float(jz)])

        confidence = min(0.95, float(area / (h * w) * 2.5))
        return landmarks[:21], confidence, True
