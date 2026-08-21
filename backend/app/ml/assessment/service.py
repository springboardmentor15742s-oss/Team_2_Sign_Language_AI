import logging
from collections import Counter
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Union
import numpy as np

from app.ml.landmarks.extractor import (
    MediaPipeLandmarkExtractor,
    LandmarkVectorExtractor,
    LandmarkResult,
)
from app.ml.features.extractor import FeatureExtractor
from app.ml.models.sign_classifier import RandomForestSignClassifier
from app.ml.assessment.scoring import ScoringEngine
from app.services.feedback_service import FeedbackEngine, LOW_CONFIDENCE

logger = logging.getLogger(__name__)


@dataclass
class SignAssessmentOutput:
    expected_sign: str
    predicted_sign: str = "unknown"
    confidence: float = 0.0
    score: float = 0.0
    is_correct: bool = False
    feedback: str = ""
    landmarks: List[List[float]] = field(default_factory=list)
    raw_landmarks: List[List[float]] = field(default_factory=list)
    top_predictions: List[Dict[str, Any]] = field(default_factory=list)
    model_version: str = "v1.0.0-rf"
    hand_detected: bool = False
    status: str = "success"  # "success", "no_hand", "quality_issue", "low_confidence", "model_not_trained", "error"
    error_message: Optional[str] = None
    category: str = ""
    suggestions: List[str] = field(default_factory=list)
    quality: Optional[Dict[str, Any]] = None
    improvement: Optional[Dict[str, Any]] = None


class SignAssessmentService:
    """
    End-to-end Sign Assessment Service evaluating learner gesture attempts.
    """

    def __init__(self, classifier: Optional[RandomForestSignClassifier] = None):
        self.image_extractor = MediaPipeLandmarkExtractor()
        self.vector_extractor = LandmarkVectorExtractor()
        self.feature_extractor = FeatureExtractor()
        self.classifier = classifier or RandomForestSignClassifier()
        self.scoring_engine = ScoringEngine()
        self.feedback_engine = FeedbackEngine()

    def evaluate_sign(
        self,
        expected_sign: str,
        input_data: Any,
        reference_landmarks: Optional[List[List[float]]] = None,
        previous_attempts: Optional[List[Dict[str, Any]]] = None,
    ) -> SignAssessmentOutput:
        expected_clean = expected_sign.strip().upper()

        # 1. Extract Landmarks
        if isinstance(input_data, dict) and "landmarks" in input_data:
            landmark_res: LandmarkResult = self.vector_extractor.extract_landmarks(input_data)
        elif isinstance(input_data, np.ndarray) and input_data.ndim == 2 and input_data.shape[0] == 21:
            landmark_res = self.vector_extractor.extract_landmarks(input_data)
        elif isinstance(input_data, (list, tuple)) and len(input_data) == 21 and isinstance(input_data[0], (list, tuple)):
            landmark_res = self.vector_extractor.extract_landmarks(input_data)
        else:
            landmark_res = self.image_extractor.extract_landmarks(input_data)

        quality = landmark_res.metadata.get("quality") if landmark_res.metadata else None

        if not landmark_res.hand_detected or len(landmark_res.landmarks) == 0:
            fb = self.feedback_engine.generate(
                expected_sign=expected_clean,
                predicted_sign="None",
                is_correct=False,
                confidence=0.0,
                score=0.0,
                status="no_hand",
                hand_detected=False,
                quality=quality,
                previous_attempts=previous_attempts,
            )
            return SignAssessmentOutput(
                expected_sign=expected_clean,
                predicted_sign="None",
                confidence=0.0,
                score=0.0,
                is_correct=False,
                feedback=fb.feedback_message,
                hand_detected=False,
                status="no_hand",
                category=fb.category,
                suggestions=fb.suggestions,
                quality=quality,
            )

        # 2. Frame/hand quality gate -- do NOT classify or score a poor-quality frame.
        if quality and not quality.get("passed", True):
            fb = self.feedback_engine.generate(
                expected_sign=expected_clean,
                predicted_sign="None",
                is_correct=False,
                confidence=0.0,
                score=0.0,
                status="quality_issue",
                hand_detected=True,
                quality=quality,
                previous_attempts=previous_attempts,
            )
            return SignAssessmentOutput(
                expected_sign=expected_clean,
                predicted_sign="None",
                confidence=0.0,
                score=0.0,
                is_correct=False,
                feedback=fb.feedback_message,
                landmarks=landmark_res.landmarks,
                raw_landmarks=landmark_res.raw_landmarks,
                hand_detected=True,
                status="quality_issue",
                category=fb.category,
                suggestions=fb.suggestions,
                quality=quality,
            )

        # 3. Extract Features
        feature_vec = self.feature_extractor.extract_features(landmark_res.landmarks)

        # 4. Model Classification Prediction
        if not self.classifier.is_trained:
            return SignAssessmentOutput(
                expected_sign=expected_clean,
                predicted_sign="unknown",
                confidence=0.0,
                score=0.0,
                is_correct=False,
                feedback="Model binary is not trained yet. Please run the model training script.",
                landmarks=landmark_res.landmarks,
                hand_detected=True,
                status="model_not_trained",
                error_message="Model file missing or untrained.",
                quality=quality,
            )

        pred_res = self.classifier.predict(feature_vec, top_k=3)
        if pred_res.error_message:
            return SignAssessmentOutput(
                expected_sign=expected_clean,
                predicted_sign="unknown",
                confidence=0.0,
                score=0.0,
                is_correct=False,
                feedback=f"Prediction error: {pred_res.error_message}",
                landmarks=landmark_res.landmarks,
                hand_detected=True,
                status="error",
                error_message=pred_res.error_message,
                quality=quality,
            )

        predicted_clean = pred_res.predicted_sign.strip().upper()

        # 5. Reference features for scoring
        ref_feature_vec = None
        if reference_landmarks and len(reference_landmarks) == 21:
            ref_feature_vec = self.feature_extractor.extract_features(reference_landmarks)

        # 6. Transparent Scoring
        score_res = self.scoring_engine.calculate_score(
            expected_sign=expected_clean,
            predicted_sign=predicted_clean,
            confidence=pred_res.confidence,
            feature_vector=feature_vec,
            reference_vector=ref_feature_vec,
        )

        # 7. Low classifier-confidence gate: do not label as "incorrect" when the
        # model simply isn't sure -- these are different failure modes.
        attempt_status = "success"
        if pred_res.confidence < LOW_CONFIDENCE:
            attempt_status = "low_confidence"

        # 8. Deterministic Feedback Generation
        fb = self.feedback_engine.generate(
            expected_sign=expected_clean,
            predicted_sign=predicted_clean,
            is_correct=score_res["is_correct"],
            confidence=pred_res.confidence,
            score=score_res["score"],
            status=attempt_status,
            hand_detected=True,
            quality=quality,
            previous_attempts=previous_attempts,
        )

        return SignAssessmentOutput(
            expected_sign=expected_clean,
            predicted_sign=predicted_clean,
            confidence=pred_res.confidence,
            score=score_res["score"],
            is_correct=score_res["is_correct"],
            feedback=fb.feedback_message,
            landmarks=landmark_res.landmarks,
            raw_landmarks=landmark_res.raw_landmarks,
            top_predictions=pred_res.top_predictions,
            model_version=pred_res.model_version,
            hand_detected=True,
            status=fb.status,
            category=fb.category,
            suggestions=fb.suggestions,
            quality=quality,
            improvement=fb.improvement,
        )

    def evaluate_sign_burst(
        self,
        expected_sign: str,
        frames: List[Any],
        previous_attempts: Optional[List[Dict[str, Any]]] = None,
    ) -> SignAssessmentOutput:
        """
        Temporal smoothing: evaluates several consecutive frames captured in
        quick succession and confirms a prediction only if multiple frames
        agree, instead of trusting a single noisy frame. Reduces false
        predictions from a momentary bad hand pose/blur/motion.
        """
        expected_clean = expected_sign.strip().upper()
        if not frames:
            return SignAssessmentOutput(expected_sign=expected_clean, status="error", error_message="No frames provided.")

        per_frame_outputs = [self.evaluate_sign(expected_clean, frame) for frame in frames]

        scoreable = [
            o for o in per_frame_outputs
            if o.hand_detected and o.status in {"success", "low_confidence"} and o.predicted_sign not in {"None", "unknown"}
        ]

        if not scoreable:
            # Surface the most informative failure across the burst (prefer an
            # explained quality issue over a bare "no hand" if both occurred).
            representative = next(
                (o for o in per_frame_outputs if o.status == "quality_issue"),
                next((o for o in per_frame_outputs if o.status == "no_hand"), per_frame_outputs[-1]),
            )
            return representative

        vote_counts = Counter(o.predicted_sign for o in scoreable)
        winning_sign, vote_count = vote_counts.most_common(1)[0]
        agreeing = [o for o in scoreable if o.predicted_sign == winning_sign]
        avg_confidence = sum(o.confidence for o in agreeing) / len(agreeing)
        best_frame_output = max(agreeing, key=lambda o: o.confidence)

        score_res = self.scoring_engine.calculate_score(
            expected_sign=expected_clean,
            predicted_sign=winning_sign,
            confidence=avg_confidence,
        )
        attempt_status = "success" if avg_confidence >= LOW_CONFIDENCE else "low_confidence"

        fb = self.feedback_engine.generate(
            expected_sign=expected_clean,
            predicted_sign=winning_sign,
            is_correct=score_res["is_correct"],
            confidence=avg_confidence,
            score=score_res["score"],
            status=attempt_status,
            hand_detected=True,
            quality=best_frame_output.quality,
            previous_attempts=previous_attempts,
        )

        stability_note = f" Confirmed across {vote_count}/{len(scoreable)} captured frames."

        return SignAssessmentOutput(
            expected_sign=expected_clean,
            predicted_sign=winning_sign,
            confidence=round(avg_confidence, 4),
            score=score_res["score"],
            is_correct=score_res["is_correct"],
            feedback=fb.feedback_message + stability_note,
            landmarks=best_frame_output.landmarks,
            raw_landmarks=best_frame_output.raw_landmarks,
            top_predictions=best_frame_output.top_predictions,
            model_version=best_frame_output.model_version,
            hand_detected=True,
            status=fb.status,
            category=fb.category,
            suggestions=fb.suggestions,
            quality=best_frame_output.quality,
            improvement=fb.improvement,
        )
