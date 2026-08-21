from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.deps import get_current_user
from app.models.user import User
from app.services.feedback_service import FeedbackEngine
from app.ml.assessment.scoring import ScoringEngine

router = APIRouter(prefix="/feedback", tags=["AI Feedback Engine"])
feedback_engine = FeedbackEngine()
scoring_engine = ScoringEngine()


class QualityIssueIn(BaseModel):
    code: str
    message: str
    severity: str = "error"


class GenerateFeedbackRequest(BaseModel):
    expected_sign: str = Field(..., description="Target sign symbol")
    detected_sign: str = Field("None", description="Sign predicted by the classifier")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="Classifier confidence for detected_sign")
    hand_detected: bool = Field(True)
    status: Optional[str] = Field(None, description="no_hand | quality_issue | low_confidence | success")
    landmark_quality: Optional[List[QualityIssueIn]] = Field(None, description="Frame/hand quality issues, if any")
    attempt_number: int = Field(1, ge=1)
    previous_score: Optional[float] = None
    previous_attempts: Optional[List[Dict[str, Any]]] = Field(
        None, description="Most-recent-first [{is_correct, confidence}, ...] for this learner+sign"
    )


@router.post("/generate", response_model=Dict[str, Any])
def generate_feedback(payload: GenerateFeedbackRequest, current_user: User = Depends(get_current_user)):
    """
    Direct wrapper around the deterministic AI Feedback Engine, for callers
    that already have a structured assessment outcome (e.g. a client-side
    preview) and just need learner-facing feedback text/suggestions without
    persisting a new attempt.
    """
    expected_clean = payload.expected_sign.strip().upper()
    detected_clean = payload.detected_sign.strip().upper()
    is_correct = payload.hand_detected and expected_clean == detected_clean and payload.status not in {"no_hand", "quality_issue"}

    score_res = scoring_engine.calculate_score(
        expected_sign=expected_clean,
        predicted_sign=detected_clean,
        confidence=payload.confidence,
    )

    status = payload.status
    if not status:
        if not payload.hand_detected:
            status = "no_hand"
        elif payload.landmark_quality and any(i.severity == "error" for i in payload.landmark_quality):
            status = "quality_issue"
        elif payload.confidence < 0.40:
            status = "low_confidence"
        else:
            status = "success"

    quality_dict = {
        "issues": [i.model_dump() for i in payload.landmark_quality],
        "passed": not any(i.severity == "error" for i in payload.landmark_quality),
    } if payload.landmark_quality else None

    result = feedback_engine.generate(
        expected_sign=expected_clean,
        predicted_sign=detected_clean,
        is_correct=score_res["is_correct"] if status == "success" else is_correct,
        confidence=payload.confidence,
        score=score_res["score"],
        status=status,
        hand_detected=payload.hand_detected,
        quality=quality_dict,
        previous_attempts=payload.previous_attempts,
    )

    return result.to_dict()
