from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import require_learner
from app.database.database import get_db
from app.models.achievement import (
    Achievement,
    UserAchievement,
)
from app.models.user import User
from app.services.achievement_engine import (
    evaluate_achievements,
    learner_metrics,
)


router = APIRouter(
    prefix="/achievements",
    tags=["Achievements"],
)


@router.get("")
def get_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_learner),
):
    newly_earned = evaluate_achievements(
        db,
        current_user,
    )

    earned_rows = (
        db.query(UserAchievement)
        .filter(
            UserAchievement.user_id
            == current_user.id
        )
        .all()
    )

    earned_map = {
        row.achievement_id:
            row.earned_at
        for row in earned_rows
    }

    achievements = (
        db.query(Achievement)
        .order_by(Achievement.id)
        .all()
    )

    return {
        "xp_points":
            current_user.xp_points,

        "metrics":
            learner_metrics(
                db,
                current_user.id,
            ),

        "newly_earned": [
            item.criteria_key
            for item in newly_earned
        ],

        "achievements": [
            {
                "id":
                    achievement.id,

                "title":
                    achievement.title,

                "description":
                    achievement.description,

                "icon":
                    achievement.icon,

                "xp_reward":
                    achievement.xp_reward,

                "criteria_key":
                    achievement.criteria_key,

                "earned":
                    achievement.id
                    in earned_map,

                "earned_at":
                    earned_map.get(
                        achievement.id
                    ),
            }
            for achievement in achievements
        ],
    }
