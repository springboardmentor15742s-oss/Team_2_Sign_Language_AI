from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.achievement import Achievement, UserAchievement
from app.models.assessment import AssessmentResult
from app.models.lesson import Enrollment, LessonCompletion
from app.models.notification import Notification, NotificationTypeEnum
from app.models.practice import PracticeSession
from app.models.user import User


ACHIEVEMENT_DEFINITIONS = [
    {
        "title": "First Step",
        "description": "Complete your first lesson.",
        "icon": "BookOpen",
        "xp_reward": 50,
        "criteria_key": "first_lesson",
    },
    {
        "title": "Dedicated Learner",
        "description": "Complete 10 lessons.",
        "icon": "GraduationCap",
        "xp_reward": 150,
        "criteria_key": "lessons_completed_10",
    },
    {
        "title": "Practice Starter",
        "description": "Complete your first practice session.",
        "icon": "Hand",
        "xp_reward": 50,
        "criteria_key": "first_practice",
    },
    {
        "title": "Practice Pro",
        "description": "Complete at least 25 gesture attempts.",
        "icon": "Target",
        "xp_reward": 100,
        "criteria_key": "practice_attempts_25",
    },
    {
        "title": "Assessment Achiever",
        "description": "Pass your first assessment.",
        "icon": "ClipboardCheck",
        "xp_reward": 100,
        "criteria_key": "first_assessment_pass",
    },
    {
        "title": "Course Graduate",
        "description": "Complete your first course.",
        "icon": "Award",
        "xp_reward": 200,
        "criteria_key": "first_course_complete",
    },
    {
        "title": "Accuracy Star",
        "description": "Reach at least 80% practice accuracy with 5 or more attempts.",
        "icon": "Star",
        "xp_reward": 150,
        "criteria_key": "practice_accuracy_80",
    },
]


def ensure_achievement_catalog(db: Session):
    for definition in ACHIEVEMENT_DEFINITIONS:
        existing = (
            db.query(Achievement)
            .filter(
                Achievement.criteria_key
                == definition["criteria_key"]
            )
            .first()
        )

        if not existing:
            db.add(Achievement(**definition))

    db.commit()


def learner_metrics(db: Session, user_id: int):
    lessons_completed = (
        db.query(LessonCompletion)
        .filter(LessonCompletion.user_id == user_id)
        .count()
    )

    practice_sessions = (
        db.query(PracticeSession)
        .filter(
            PracticeSession.user_id == user_id,
            PracticeSession.attempts > 0,
        )
        .count()
    )

    practice_totals = (
        db.query(
            func.coalesce(
                func.sum(PracticeSession.attempts),
                0,
            ),
            func.coalesce(
                func.sum(
                    PracticeSession.successful_attempts
                ),
                0,
            ),
        )
        .filter(
            PracticeSession.user_id == user_id
        )
        .first()
    )

    total_attempts = int(
        practice_totals[0] or 0
    )

    successful_attempts = int(
        practice_totals[1] or 0
    )

    practice_accuracy = (
        round(
            successful_attempts
            / total_attempts
            * 100,
            2,
        )
        if total_attempts
        else 0
    )

    passed_assessments = (
        db.query(AssessmentResult)
        .filter(
            AssessmentResult.user_id == user_id,
            AssessmentResult.passed == 1,
        )
        .count()
    )

    completed_courses = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == user_id,
            Enrollment.completed_at.isnot(None),
        )
        .count()
    )

    return {
        "lessons_completed": lessons_completed,
        "practice_sessions": practice_sessions,
        "total_attempts": total_attempts,
        "successful_attempts": successful_attempts,
        "practice_accuracy": practice_accuracy,
        "passed_assessments": passed_assessments,
        "completed_courses": completed_courses,
    }


def criteria_met(
    criteria_key: str,
    metrics: dict,
) -> bool:
    rules = {
        "first_lesson":
            metrics["lessons_completed"] >= 1,

        "lessons_completed_10":
            metrics["lessons_completed"] >= 10,

        "first_practice":
            metrics["practice_sessions"] >= 1,

        "practice_attempts_25":
            metrics["total_attempts"] >= 25,

        "first_assessment_pass":
            metrics["passed_assessments"] >= 1,

        "first_course_complete":
            metrics["completed_courses"] >= 1,

        "practice_accuracy_80":
            metrics["total_attempts"] >= 5
            and metrics["practice_accuracy"] >= 80,
    }

    return rules.get(
        criteria_key,
        False,
    )


def evaluate_achievements(
    db: Session,
    user: User,
):
    ensure_achievement_catalog(db)

    metrics = learner_metrics(
        db,
        user.id,
    )

    achievements = (
        db.query(Achievement)
        .order_by(Achievement.id)
        .all()
    )

    earned_ids = {
        row.achievement_id
        for row in (
            db.query(UserAchievement)
            .filter(
                UserAchievement.user_id
                == user.id
            )
            .all()
        )
    }

    newly_earned = []

    for achievement in achievements:
        if achievement.id in earned_ids:
            continue

        if not criteria_met(
            achievement.criteria_key,
            metrics,
        ):
            continue

        user_achievement = UserAchievement(
            user_id=user.id,
            achievement_id=achievement.id,
        )

        db.add(user_achievement)

        user.xp_points += (
            achievement.xp_reward or 0
        )

        db.add(
            Notification(
                user_id=user.id,
                title="Achievement unlocked!",
                message=(
                    f"You earned "
                    f"{achievement.title} "
                    f"(+{achievement.xp_reward} XP)."
                ),
                type=
                    NotificationTypeEnum.achievement,
                is_read=False,
            )
        )

        newly_earned.append(
            achievement
        )

    db.commit()

    return newly_earned
