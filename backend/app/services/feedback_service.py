"""
AI Feedback Engine for sign assessment attempts.

Deterministic / rule-based by design (per architecture requirement: scoring
and feedback must stay traceable and must not depend on an external LLM).
Consumes the structured outcome of a single assessment attempt -- expected
vs. detected sign, confidence, hand-detection/frame-quality status, and
optionally recent attempt history for the same learner+sign -- and produces
a structured, learner-facing feedback payload.

Three distinct concepts this engine must never conflate:
  - MODEL CONFIDENCE: how sure the classifier is about its prediction.
  - ASSESSMENT ACCURACY: how many assessment questions the learner got right.
  - MODEL EVALUATION ACCURACY: the trained model's performance on the held-out
    test dataset (see app/ml/evaluation).
This engine only ever reasons about the first two, for a single attempt.
"""
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


HIGH_CONFIDENCE = 0.85
MEDIUM_CONFIDENCE = 0.60
LOW_CONFIDENCE = 0.40
IMPROVEMENT_DELTA = 0.10
REPEATED_MISTAKE_STREAK = 2


@dataclass
class FeedbackResult:
    status: str
    category: str
    score: float
    confidence: float
    feedback_message: str
    suggestions: List[str] = field(default_factory=list)
    detected_sign: str = ""
    expected_sign: str = ""
    improvement: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "category": self.category,
            "score": self.score,
            "confidence": self.confidence,
            "feedback_message": self.feedback_message,
            "suggestions": self.suggestions,
            "detected_sign": self.detected_sign,
            "expected_sign": self.expected_sign,
            "improvement": self.improvement,
        }


class FeedbackEngine:
    """Rule-based feedback generator for a single sign assessment attempt."""

    def generate(
        self,
        *,
        expected_sign: str,
        predicted_sign: str,
        is_correct: bool,
        confidence: float,
        score: float,
        status: str,
        hand_detected: bool,
        quality: Optional[Dict[str, Any]] = None,
        previous_attempts: Optional[List[Dict[str, Any]]] = None,
    ) -> FeedbackResult:
        quality = quality or {}
        issues = quality.get("issues", []) if isinstance(quality, dict) else []
        suggestions: List[str] = []
        improvement = self._analyze_history(previous_attempts, is_correct, confidence)

        # 1. Hand not detected at all.
        if status == "no_hand" or not hand_detected:
            return FeedbackResult(
                status="no_hand",
                category="hand_not_detected",
                score=0.0,
                confidence=0.0,
                feedback_message="Hand not detected. Place your hand clearly inside the camera frame.",
                suggestions=[
                    "Make sure your hand is fully visible to the camera.",
                    "Improve lighting if the room is dim.",
                ],
                detected_sign=predicted_sign,
                expected_sign=expected_sign,
            )

        # 2. Frame/hand quality issues (too far/close/out of frame/dark/multi-hand ambiguity).
        error_issues = [i for i in issues if i.get("severity") == "error"]
        if error_issues:
            primary = error_issues[0]
            suggestions = [i["message"] for i in issues if i is not primary]
            return FeedbackResult(
                status="quality_issue",
                category=primary["code"],
                score=0.0,
                confidence=round(confidence, 4),
                feedback_message=primary["message"],
                suggestions=suggestions,
                detected_sign=predicted_sign,
                expected_sign=expected_sign,
            )

        warning_issues = [i["message"] for i in issues if i.get("severity") == "warning"]

        # 3. Model could not confidently classify the gesture.
        if status == "low_confidence" or confidence < LOW_CONFIDENCE:
            message = "Unable to confidently recognize the sign."
            if warning_issues:
                message += " " + warning_issues[0]
            else:
                message += " Center your hand, hold it steady, and try again."
            return FeedbackResult(
                status="low_confidence",
                category="low_confidence",
                score=score,
                confidence=round(confidence, 4),
                feedback_message=message,
                suggestions=warning_issues or ["Hold the pose steady for a full second before capturing."],
                detected_sign=predicted_sign,
                expected_sign=expected_sign,
                improvement=improvement,
            )

        # 4. Correct / incorrect classification with sufficient confidence.
        if is_correct:
            if improvement.get("repeated_mistake"):
                # Correct now, but flag as recovered from a mistake streak.
                pass
            if confidence >= HIGH_CONFIDENCE:
                category = "correct_high_confidence"
                message = (
                    f"Excellent! The model recognized the '{expected_sign}' sign with "
                    f"{round(confidence * 100)}% confidence. Your hand was well positioned."
                )
            elif confidence >= MEDIUM_CONFIDENCE:
                category = "correct_medium_confidence"
                message = f"Correct sign for '{expected_sign}'. Hold your posture steady for a cleaner performance."
            else:
                category = "correct_low_confidence"
                message = (
                    f"Sign '{expected_sign}' detected correctly, but confidence was on the lower side. "
                    "Try improving lighting and hold the pose steady."
                )

            if improvement.get("improving"):
                category = "improving"
                message += (
                    f" Good improvement! Your confidence increased from "
                    f"{improvement['previous_confidence']}% to {round(confidence * 100)}% "
                    "compared with your previous attempt."
                )

            return FeedbackResult(
                status="success",
                category=category,
                score=score,
                confidence=round(confidence, 4),
                feedback_message=message,
                suggestions=warning_issues,
                detected_sign=predicted_sign,
                expected_sign=expected_sign,
                improvement=improvement,
            )

        # 5. Wrong sign, confidently classified.
        category = "wrong_sign"
        message = (
            f"You performed a different sign than expected. The target was '{expected_sign}', "
            f"but the model detected '{predicted_sign}'. Check your finger positioning."
        )
        if improvement.get("repeated_mistake"):
            category = "repeated_mistake"
            message += (
                f" You have missed '{expected_sign}' several times in a row -- "
                "focus on matching the reference hand shape closely before capturing."
            )

        return FeedbackResult(
            status="success",
            category=category,
            score=score,
            confidence=round(confidence, 4),
            feedback_message=message,
            suggestions=warning_issues or ["Compare your hand shape carefully against the target sign guide."],
            detected_sign=predicted_sign,
            expected_sign=expected_sign,
            improvement=improvement,
        )

    @staticmethod
    def _analyze_history(
        previous_attempts: Optional[List[Dict[str, Any]]],
        is_correct: bool,
        confidence: float,
    ) -> Dict[str, Any]:
        """
        previous_attempts: most-recent-first list of {"is_correct": bool, "confidence": float}
        for the same learner + expected sign, excluding the current attempt.
        """
        if not previous_attempts:
            return {"repeated_mistake": False, "improving": False, "previous_confidence": None, "recent_wrong_streak": 0}

        recent_wrong_streak = 0
        for a in previous_attempts:
            if not a.get("is_correct"):
                recent_wrong_streak += 1
            else:
                break

        repeated_mistake = (not is_correct) and recent_wrong_streak >= REPEATED_MISTAKE_STREAK

        prev_confidence = previous_attempts[0].get("confidence")
        improving = (
            prev_confidence is not None
            and confidence >= prev_confidence + IMPROVEMENT_DELTA
        )

        return {
            "repeated_mistake": repeated_mistake,
            "improving": bool(improving),
            "previous_confidence": round(prev_confidence * 100) if prev_confidence is not None else None,
            "recent_wrong_streak": recent_wrong_streak,
        }
