from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.assessment_attempt import SignAssessmentAttempt
from app.models.assessment_session import SignAssessmentSession
from app.models.achievement import Achievement, UserAchievement

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Real, persisted learner activity -- computed from SignAssessmentAttempt /
    SignAssessmentSession, the tables the live assessment/practice flow
    actually writes to. Nothing here is hardcoded.
    """
    attempts = (
        db.query(SignAssessmentAttempt)
        .filter(SignAssessmentAttempt.user_id == current_user.id)
        .order_by(SignAssessmentAttempt.created_at.desc())
        .all()
    )
    sessions = (
        db.query(SignAssessmentSession)
        .filter(SignAssessmentSession.user_id == current_user.id)
        .order_by(SignAssessmentSession.completed_at.desc())
        .all()
    )

    total_answers = len(attempts)
    correct_answers = sum(1 for a in attempts if a.is_correct)
    gesture_accuracy = round((correct_answers / total_answers) * 100, 2) if total_answers else 0.0

    # Weekly activity: attempt counts for the current Mon-Sun week (UTC).
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_counts = {d: 0 for d in days}
    now = datetime.now(timezone.utc)
    start_of_week = now - timedelta(days=now.weekday())
    for a in attempts:
        if a.created_at is None:
            continue
        delta_days = (a.created_at.date() - start_of_week.date()).days
        if 0 <= delta_days < 7:
            weekly_counts[days[delta_days]] += 1
    weekly_activity = [{"day": d, "count": weekly_counts[d]} for d in days]

    recent_activity: List[Dict[str, Any]] = []
    for s in sessions[:3]:
        recent_activity.append({
            "type": "assessment",
            "title": f"{s.assessment_type.capitalize()} Assessment",
            "score": s.accuracy,
            "correct": s.correct_count,
            "total": s.total_questions,
            "date": s.completed_at,
        })
    for a in attempts[:5]:
        recent_activity.append({
            "type": "practice",
            "sign": a.expected_sign,
            "predicted": a.predicted_sign,
            "correct": a.is_correct,
            "confidence": a.confidence,
            "date": a.created_at,
        })
    recent_activity.sort(key=lambda r: r["date"] or now, reverse=True)
    recent_activity = recent_activity[:8]

    earned = (
        db.query(Achievement)
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .filter(UserAchievement.user_id == current_user.id)
        .all()
    )

    return {
        "total_xp": current_user.xp_points,
        "current_streak": current_user.current_streak,
        "gesture_accuracy": gesture_accuracy,
        "assessments_completed": len(sessions),
        "correct_answers": correct_answers,
        "total_answers": total_answers,
        "achievements_count": len(earned),
        "achievements": [{"title": a.title, "description": a.description, "icon": a.icon} for a in earned],
        "recent_activity": recent_activity,
        "weekly_activity": weekly_activity,
    }


@router.get("/achievements", response_model=List[Dict[str, Any]])
def list_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    All defined achievements (from the seeded Achievement table) with real
    earned/locked status and earn date for the current user -- not a
    hardcoded list, and never fabricates a locked achievement as earned.
    """
    all_achievements = db.query(Achievement).order_by(Achievement.id.asc()).all()
    earned_rows = {
        row.achievement_id: row.earned_at
        for row in db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    }

    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "icon": a.icon,
            "xp_reward": a.xp_reward,
            "criteria_key": a.criteria_key,
            "unlocked": a.id in earned_rows,
            "earned_at": earned_rows.get(a.id),
        }
        for a in all_achievements
    ]
