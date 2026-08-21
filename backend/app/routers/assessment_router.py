import random
from datetime import datetime, timezone
from typing import Any, Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.assessment_attempt import SignAssessmentAttempt
from app.models.assessment_session import SignAssessmentSession
from app.ml.assessment.service import SignAssessmentService, SignAssessmentOutput
from app.ml.dataset.config import ASL_CLASSES, DEFAULT_REPORT_PATH
from app.ml.evaluation.reports import ReportManager
from app.services.gamification_service import award_attempt_xp, award_session_xp, update_streak, check_and_award_achievements
from app.services.audit_service import log_activity

router = APIRouter(prefix="/assessment", tags=["Sign Assessment ML"])
assessment_service = SignAssessmentService()

ALPHABET_CLASSES = [c for c in ASL_CLASSES if len(c) == 1 and c.isalpha()]
ASSESSMENT_TYPES = {"single", "quiz", "alphabet", "mixed"}
PREVIOUS_ATTEMPTS_LOOKBACK = 5


class PredictRequest(BaseModel):
    image_data: Optional[str] = Field(None, description="Base64 encoded image string or data URL")
    landmarks: Optional[List[List[float]]] = Field(None, description="21-point landmark array [[x,y,z], ...]")


class EvaluateRequest(BaseModel):
    expected_sign: str = Field(..., max_length=50, description="Target expected sign symbol, e.g., 'A'")
    image_data: Optional[str] = Field(None, description="Base64 encoded image frame")
    landmarks: Optional[List[List[float]]] = Field(None, description="21-point landmark array [[x,y,z], ...]")
    frames: Optional[List[str]] = Field(
        None, max_length=6,
        description="Optional burst of consecutive base64 frames for temporal-smoothing majority-vote prediction",
    )
    lesson_id: Optional[int] = Field(None, description="Associated lesson ID")


class SubmitSessionRequest(BaseModel):
    assessment_type: str = Field("single", description="single | quiz | alphabet | mixed")
    attempt_ids: List[int] = Field(..., min_length=1, description="Attempt IDs collected during the session")


def _get_previous_attempts(db: Session, user_id: int, expected_sign: str) -> List[Dict[str, Any]]:
    rows = (
        db.query(SignAssessmentAttempt)
        .filter(
            SignAssessmentAttempt.user_id == user_id,
            SignAssessmentAttempt.expected_sign == expected_sign.strip().upper(),
        )
        .order_by(SignAssessmentAttempt.created_at.desc())
        .limit(PREVIOUS_ATTEMPTS_LOOKBACK)
        .all()
    )
    return [{"is_correct": r.is_correct, "confidence": r.confidence} for r in rows]


def _class_difficulty_map() -> Dict[str, str]:
    """Tags classes as 'challenging' using real per-class F1 from the last evaluation report, if available."""
    report = ReportManager.load_report(DEFAULT_REPORT_PATH)
    difficulty = {}
    per_class = (report or {}).get("per_class_metrics", {})
    for cls in ASL_CLASSES:
        f1 = per_class.get(cls, {}).get("f1_score")
        if f1 is None:
            difficulty[cls] = "intermediate"
        elif f1 >= 0.97:
            difficulty[cls] = "beginner"
        elif f1 >= 0.90:
            difficulty[cls] = "intermediate"
        else:
            difficulty[cls] = "advanced"
    return difficulty


DIFFICULTY_LEVELS = {"beginner", "intermediate", "advanced"}
RECENT_HISTORY_LOOKBACK = 25


def _recently_attempted_signs(db: Session, user_id: int) -> set:
    rows = (
        db.query(SignAssessmentAttempt.expected_sign)
        .filter(SignAssessmentAttempt.user_id == user_id)
        .order_by(SignAssessmentAttempt.created_at.desc())
        .limit(RECENT_HISTORY_LOOKBACK)
        .all()
    )
    return {r[0] for r in rows}


def _generate_questions(
    assessment_type: str,
    count: int,
    difficulty_filter: Optional[str] = None,
    recently_attempted: Optional[set] = None,
) -> List[Dict[str, Any]]:
    difficulty = _class_difficulty_map()
    recently_attempted = recently_attempted or set()

    base_pool = ALPHABET_CLASSES if assessment_type in {"single", "alphabet", "quiz"} else ASL_CLASSES
    pool = base_pool
    if difficulty_filter:
        tiered = [c for c in base_pool if difficulty.get(c) == difficulty_filter]
        # Fall back to the full pool if the requested tier doesn't have enough
        # classes to satisfy the requested count -- never silently under-fill.
        if len(tiered) >= min(count, len(base_pool)):
            pool = tiered

    # Prefer signs the learner hasn't attempted recently, topping up from the
    # rest of the pool only if that isn't enough to reach the requested count.
    fresh = [c for c in pool if c not in recently_attempted]
    stale = [c for c in pool if c in recently_attempted]
    preferred_pool = fresh + stale if fresh else pool

    if assessment_type == "single":
        signs = [random.choice(fresh)] if fresh else [random.choice(pool)]
    elif assessment_type in {"alphabet", "quiz"}:
        k = min(max(count, 1), len(pool))
        # Sample preferentially from the "fresh" (not recently attempted) set.
        chosen = random.sample(fresh, k=min(k, len(fresh))) if fresh else []
        remaining = k - len(chosen)
        if remaining > 0:
            leftover = [c for c in pool if c not in chosen]
            chosen += random.sample(leftover, k=min(remaining, len(leftover)))
        random.shuffle(chosen)
        signs = chosen
    else:  # mixed -- may sample with repeats for large counts, no immediate duplicates
        k = max(count, 1)
        signs = []
        last = None
        attempts_guard = 0
        while len(signs) < k and attempts_guard < k * 20:
            attempts_guard += 1
            candidate = random.choice(preferred_pool if preferred_pool else pool)
            if candidate == last and len(pool) > 1:
                continue
            signs.append(candidate)
            last = candidate

    return [
        {"order_index": i + 1, "target_sign": s, "difficulty": difficulty.get(s, "intermediate")}
        for i, s in enumerate(signs)
    ]


@router.get("/classes", response_model=Dict[str, Any])
def get_supported_classes(current_user: User = Depends(get_current_user)):
    """
    Supported sign classes as reported by the currently deployed classifier
    (not hardcoded in the frontend).
    """
    return {
        "classes": ASL_CLASSES,
        "alphabet_classes": ALPHABET_CLASSES,
        "count": len(ASL_CLASSES),
        "model_version": assessment_service.classifier.model_version,
        "is_trained": assessment_service.classifier.is_trained,
    }


@router.get("/questions", response_model=Dict[str, Any])
def get_assessment_questions(
    type: str = "single",
    count: int = 5,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generates a randomized question set for one of the supported assessment
    types, drawn from the classifier's actual supported class list. Prefers
    signs the learner hasn't attempted recently, and can be filtered to a
    difficulty tier derived from the model's real per-class evaluation F1.
    """
    assessment_type = type.strip().lower()
    if assessment_type not in ASSESSMENT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unsupported assessment type. Use one of: {sorted(ASSESSMENT_TYPES)}")
    if count < 1 or count > 50:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "count must be between 1 and 50.")

    difficulty_filter = difficulty.strip().lower() if difficulty else None
    if difficulty_filter and difficulty_filter not in DIFFICULTY_LEVELS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unsupported difficulty. Use one of: {sorted(DIFFICULTY_LEVELS)}")

    recently_attempted = _recently_attempted_signs(db, current_user.id)
    questions = _generate_questions(assessment_type, count, difficulty_filter, recently_attempted)
    log_activity(db, current_user.id, "ASSESSMENT_STARTED", meta=f"type={assessment_type} count={len(questions)} difficulty={difficulty_filter or 'any'}")
    db.commit()
    return {
        "assessment_type": assessment_type,
        "difficulty": difficulty_filter,
        "count": len(questions),
        "questions": questions,
    }


@router.post("/predict", response_model=Dict[str, Any])
def predict_sign(payload: PredictRequest, current_user: User = Depends(get_current_user)):
    """
    Predict sign class from frame image or landmark array (no DB persistence).
    Used for lightweight/live status checks (e.g. hand-detected indicator).
    """
    input_data = payload.landmarks if payload.landmarks else payload.image_data
    if not input_data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Either image_data or landmarks must be provided.")

    eval_out: SignAssessmentOutput = assessment_service.evaluate_sign(
        expected_sign="A",
        input_data=input_data,
    )

    return {
        "predicted_sign": eval_out.predicted_sign,
        "confidence": eval_out.confidence,
        "top_predictions": eval_out.top_predictions,
        "hand_detected": eval_out.hand_detected,
        "raw_landmarks": eval_out.raw_landmarks,
        "model_version": eval_out.model_version,
        "status": eval_out.status,
        "quality": eval_out.quality,
    }


@router.post("/evaluate", response_model=Dict[str, Any])
def evaluate_sign_attempt(
    payload: EvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate learner sign attempt against expected sign, calculate score, and store attempt in DB.
    If `frames` (a short burst of consecutive captures) is supplied, uses
    majority-vote temporal smoothing across them instead of trusting a
    single frame.
    """
    valid_frames = [f for f in (payload.frames or []) if f and isinstance(f, str) and len(f) > 20]
    input_data = payload.landmarks if payload.landmarks else payload.image_data
    if not input_data and not valid_frames:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Either image_data, landmarks, or valid frames must be provided.")

    previous_attempts = _get_previous_attempts(db, current_user.id, payload.expected_sign)

    if valid_frames:
        eval_out: SignAssessmentOutput = assessment_service.evaluate_sign_burst(
            expected_sign=payload.expected_sign,
            frames=valid_frames,
            previous_attempts=previous_attempts,
        )
    else:
        eval_out: SignAssessmentOutput = assessment_service.evaluate_sign(
            expected_sign=payload.expected_sign,
            input_data=input_data,
            previous_attempts=previous_attempts,
        )

    # Store assessment attempt record in DB
    attempt = SignAssessmentAttempt(
        user_id=current_user.id,
        lesson_id=payload.lesson_id,
        expected_sign=eval_out.expected_sign,
        predicted_sign=eval_out.predicted_sign,
        confidence=eval_out.confidence,
        score=eval_out.score,
        is_correct=eval_out.is_correct,
        feedback=eval_out.feedback,
        landmarks_data=eval_out.landmarks if eval_out.landmarks else None,
        model_version=eval_out.model_version,
    )
    db.add(attempt)
    db.flush()  # make this attempt visible to the streak query below (session autoflush is off)

    xp_awarded = 0
    if eval_out.status in {"success", "low_confidence"}:
        xp_awarded = award_attempt_xp(db, current_user, eval_out.is_correct)
        update_streak(db, current_user)
        log_activity(db, current_user.id, "SIGN_EVALUATED", meta=f"sign={eval_out.expected_sign} correct={eval_out.is_correct}")

    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "expected_sign": eval_out.expected_sign,
        "predicted_sign": eval_out.predicted_sign,
        "confidence": eval_out.confidence,
        "score": eval_out.score,
        "is_correct": eval_out.is_correct,
        "feedback": eval_out.feedback,
        "status": eval_out.status,
        "category": eval_out.category,
        "suggestions": eval_out.suggestions,
        "quality": eval_out.quality,
        "improvement": eval_out.improvement,
        "top_predictions": eval_out.top_predictions,
        "hand_detected": eval_out.hand_detected,
        "landmarks": eval_out.landmarks,
        "raw_landmarks": eval_out.raw_landmarks,
        "model_version": eval_out.model_version,
        "xp_awarded": xp_awarded,
        "created_at": attempt.created_at,
    }


@router.post("/submit", response_model=Dict[str, Any])
def submit_assessment_session(
    payload: SubmitSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aggregates a set of per-question /assessment/evaluate attempts (identified
    by attempt_id) into one persisted assessment session with a real score
    computed from the underlying attempts -- never fabricated client-side.
    """
    assessment_type = payload.assessment_type.strip().lower()
    if assessment_type not in ASSESSMENT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unsupported assessment type. Use one of: {sorted(ASSESSMENT_TYPES)}")

    attempts = (
        db.query(SignAssessmentAttempt)
        .filter(
            SignAssessmentAttempt.id.in_(payload.attempt_ids),
            SignAssessmentAttempt.user_id == current_user.id,
        )
        .all()
    )
    if not attempts:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No valid attempts found for the given attempt_ids.")

    total = len(attempts)
    correct = sum(1 for a in attempts if a.is_correct)
    incorrect = total - correct
    accuracy = round((correct / total) * 100, 2) if total else 0.0
    avg_confidence = round(sum(a.confidence for a in attempts) / total, 4) if total else 0.0

    per_sign: Dict[str, Dict[str, int]] = {}
    for a in attempts:
        stat = per_sign.setdefault(a.expected_sign, {"correct": 0, "total": 0})
        stat["total"] += 1
        if a.is_correct:
            stat["correct"] += 1

    strong_signs = sorted(
        [s for s, v in per_sign.items() if v["total"] and v["correct"] / v["total"] >= 0.75],
        key=lambda s: -(per_sign[s]["correct"] / per_sign[s]["total"]),
    )
    weak_signs = sorted(
        [s for s, v in per_sign.items() if v["total"] and v["correct"] / v["total"] < 0.75],
        key=lambda s: per_sign[s]["correct"] / per_sign[s]["total"],
    )

    session = SignAssessmentSession(
        user_id=current_user.id,
        assessment_type=assessment_type,
        attempt_ids=[a.id for a in attempts],
        total_questions=total,
        correct_count=correct,
        incorrect_count=incorrect,
        accuracy=accuracy,
        average_confidence=avg_confidence,
        strong_signs=strong_signs,
        weak_signs=weak_signs,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.flush()  # assign session.id before achievement checks that may reference it

    session_xp = award_session_xp(db, current_user)
    newly_earned = check_and_award_achievements(db, current_user, last_session=session)
    log_activity(db, current_user.id, "ASSESSMENT_COMPLETED", meta=f"type={assessment_type} accuracy={accuracy} correct={correct}/{total}")

    db.commit()
    db.refresh(session)

    result = _session_to_dict(session, attempts)
    result["xp_awarded"] = session_xp
    result["achievements_earned"] = newly_earned
    return result


def _session_to_dict(session: SignAssessmentSession, attempts: Optional[List[SignAssessmentAttempt]] = None) -> Dict[str, Any]:
    return {
        "id": session.id,
        "assessment_type": session.assessment_type,
        "total_questions": session.total_questions,
        "correct_count": session.correct_count,
        "incorrect_count": session.incorrect_count,
        "accuracy": session.accuracy,
        "average_confidence": session.average_confidence,
        "strong_signs": session.strong_signs or [],
        "weak_signs": session.weak_signs or [],
        "started_at": session.started_at,
        "completed_at": session.completed_at,
        "attempts": [
            {
                "id": a.id,
                "expected_sign": a.expected_sign,
                "predicted_sign": a.predicted_sign,
                "confidence": a.confidence,
                "score": a.score,
                "is_correct": a.is_correct,
                "feedback": a.feedback,
            }
            for a in attempts
        ] if attempts is not None else None,
    }


@router.get("/progress", response_model=Dict[str, Any])
def get_assessment_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Per-sign mastery rollup computed live from the learner's attempt history
    (no separate aggregation table to keep in sync).
    """
    attempts = (
        db.query(SignAssessmentAttempt)
        .filter(SignAssessmentAttempt.user_id == current_user.id)
        .all()
    )

    per_sign: Dict[str, Dict[str, Any]] = {}
    for a in attempts:
        stat = per_sign.setdefault(a.expected_sign, {"attempts": 0, "correct": 0, "confidence_sum": 0.0})
        stat["attempts"] += 1
        stat["confidence_sum"] += a.confidence
        if a.is_correct:
            stat["correct"] += 1

    signs_summary = []
    for sign, stat in per_sign.items():
        accuracy = round((stat["correct"] / stat["attempts"]) * 100, 2) if stat["attempts"] else 0.0
        signs_summary.append({
            "sign": sign,
            "attempts": stat["attempts"],
            "correct": stat["correct"],
            "accuracy": accuracy,
            "average_confidence": round(stat["confidence_sum"] / stat["attempts"], 4) if stat["attempts"] else 0.0,
        })
    signs_summary.sort(key=lambda s: s["accuracy"])

    strong_signs = [s["sign"] for s in signs_summary if s["attempts"] >= 2 and s["accuracy"] >= 75]
    weak_signs = [s["sign"] for s in signs_summary if s["attempts"] >= 1 and s["accuracy"] < 60]

    total_attempts = len(attempts)
    total_correct = sum(1 for a in attempts if a.is_correct)
    overall_accuracy = round((total_correct / total_attempts) * 100, 2) if total_attempts else 0.0

    return {
        "total_attempts": total_attempts,
        "total_correct": total_correct,
        "overall_accuracy": overall_accuracy,
        "signs": signs_summary,
        "strong_signs": strong_signs,
        "weak_signs": weak_signs,
    }


@router.get("/sessions/{session_id}", response_model=Dict[str, Any])
def get_assessment_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.get(SignAssessmentSession, session_id)
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment session not found.")
    if session.user_id != current_user.id and current_user.role.value not in {"admin", "instructor", "accessibility_trainer"}:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access forbidden.")

    attempts = (
        db.query(SignAssessmentAttempt)
        .filter(SignAssessmentAttempt.id.in_(session.attempt_ids or []))
        .order_by(SignAssessmentAttempt.created_at.asc())
        .all()
    )
    return _session_to_dict(session, attempts)


@router.get("/history", response_model=List[Dict[str, Any]])
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve current authenticated learner's sign assessment attempt history.
    """
    attempts = (
        db.query(SignAssessmentAttempt)
        .filter(SignAssessmentAttempt.user_id == current_user.id)
        .order_by(SignAssessmentAttempt.created_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "expected_sign": a.expected_sign,
            "predicted_sign": a.predicted_sign,
            "confidence": a.confidence,
            "score": a.score,
            "is_correct": a.is_correct,
            "feedback": a.feedback,
            "model_version": a.model_version,
            "created_at": a.created_at,
        }
        for a in attempts
    ]


@router.get("/{attempt_id}", response_model=Dict[str, Any])
def get_assessment_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve specific assessment attempt detail by ID.
    """
    attempt = db.get(SignAssessmentAttempt, attempt_id)
    if not attempt:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment attempt not found.")

    if attempt.user_id != current_user.id and current_user.role.value not in {"admin", "instructor", "accessibility_trainer"}:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access forbidden.")

    return {
        "id": attempt.id,
        "user_id": attempt.user_id,
        "expected_sign": attempt.expected_sign,
        "predicted_sign": attempt.predicted_sign,
        "confidence": attempt.confidence,
        "score": attempt.score,
        "is_correct": attempt.is_correct,
        "feedback": attempt.feedback,
        "landmarks_data": attempt.landmarks_data,
        "model_version": attempt.model_version,
        "created_at": attempt.created_at,
    }
