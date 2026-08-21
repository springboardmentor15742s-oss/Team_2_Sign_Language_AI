"""
Gamification: XP, streak, and achievement bookkeeping.

Called exactly once per real write (a new attempt/session being created),
never on read/refresh, so re-loading a page can never double-award XP or
re-advance the streak.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import List

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.assessment_attempt import SignAssessmentAttempt
from app.models.achievement import Achievement, UserAchievement
from app.models.assessment_session import SignAssessmentSession

logger = logging.getLogger(__name__)

XP_PER_ATTEMPT = 2
XP_PER_CORRECT_ATTEMPT = 10
XP_PER_SESSION_COMPLETE = 20


def award_attempt_xp(db: Session, user: User, is_correct: bool) -> int:
    amount = XP_PER_ATTEMPT + (XP_PER_CORRECT_ATTEMPT if is_correct else 0)
    user.xp_points = (user.xp_points or 0) + amount
    return amount


def award_session_xp(db: Session, user: User) -> int:
    user.xp_points = (user.xp_points or 0) + XP_PER_SESSION_COMPLETE
    return XP_PER_SESSION_COMPLETE


def update_streak(db: Session, user: User) -> int:
    """
    Recomputes the learner's current streak as the number of consecutive
    calendar days (ending today, UTC) with at least one recorded
    SignAssessmentAttempt. Called right after a new attempt is written, so
    "today" always has activity at call time.
    """
    rows = (
        db.query(SignAssessmentAttempt.created_at)
        .filter(SignAssessmentAttempt.user_id == user.id)
        .all()
    )
    active_dates = {r[0].date() for r in rows if r[0] is not None}
    if not active_dates:
        user.current_streak = 0
        return 0

    today = datetime.now(timezone.utc).date()
    streak = 0
    cursor = today
    while cursor in active_dates:
        streak += 1
        cursor -= timedelta(days=1)

    user.current_streak = streak
    return streak


ACHIEVEMENT_DEFINITIONS = [
    {"criteria_key": "first_assessment", "title": "First Steps", "description": "Complete your first assessment.", "icon": "Award", "xp_reward": 15},
    {"criteria_key": "perfect_score", "title": "Perfect Score", "description": "Score 100% on an assessment.", "icon": "Trophy", "xp_reward": 30},
    {"criteria_key": "streak_3", "title": "3-Day Streak", "description": "Practice or assess 3 days in a row.", "icon": "Flame", "xp_reward": 20},
    {"criteria_key": "streak_7", "title": "7-Day Streak", "description": "Practice or assess 7 days in a row.", "icon": "Flame", "xp_reward": 50},
    {"criteria_key": "sign_master_50", "title": "Sign Master", "description": "Get 50 correct sign attempts.", "icon": "Sparkles", "xp_reward": 40},
    {"criteria_key": "alphabet_explorer", "title": "Alphabet Explorer", "description": "Attempt at least 20 different sign classes.", "icon": "BookOpen", "xp_reward": 25},
]


def check_and_award_achievements(db: Session, user: User, last_session: SignAssessmentSession | None = None) -> List[str]:
    """Evaluates achievement criteria against real persisted data and awards any newly-earned ones."""
    already_earned = {
        row[0] for row in db.query(UserAchievement.achievement_id)
        .join(Achievement, Achievement.id == UserAchievement.achievement_id)
        .filter(UserAchievement.user_id == user.id)
        .all()
    }
    achievements_by_key = {a.criteria_key: a for a in db.query(Achievement).all()}

    total_correct = db.query(SignAssessmentAttempt).filter(
        SignAssessmentAttempt.user_id == user.id, SignAssessmentAttempt.is_correct.is_(True)
    ).count()
    total_sessions = db.query(SignAssessmentSession).filter(SignAssessmentSession.user_id == user.id).count()
    distinct_signs = {
        row[0] for row in db.query(SignAssessmentAttempt.expected_sign)
        .filter(SignAssessmentAttempt.user_id == user.id).distinct().all()
    }

    earned_keys = []
    if total_sessions >= 1:
        earned_keys.append("first_assessment")
    if last_session is not None and last_session.total_questions > 0 and last_session.correct_count == last_session.total_questions:
        earned_keys.append("perfect_score")
    if user.current_streak >= 3:
        earned_keys.append("streak_3")
    if user.current_streak >= 7:
        earned_keys.append("streak_7")
    if total_correct >= 50:
        earned_keys.append("sign_master_50")
    if len(distinct_signs) >= 20:
        earned_keys.append("alphabet_explorer")

    newly_earned = []
    for key in earned_keys:
        achievement = achievements_by_key.get(key)
        if not achievement or achievement.id in already_earned:
            continue
        db.add(UserAchievement(user_id=user.id, achievement_id=achievement.id))
        user.xp_points = (user.xp_points or 0) + achievement.xp_reward
        newly_earned.append(achievement.title)
        already_earned.add(achievement.id)

    if newly_earned:
        logger.info(f"User {user.id} earned achievements: {newly_earned}")
    return newly_earned
