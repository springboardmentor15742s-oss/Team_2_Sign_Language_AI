from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User, RoleEnum
from app.models.lesson import Lesson
from app.models.assessment_attempt import SignAssessmentAttempt
from app.ml.evaluation.reports import ReportManager
from app.ml.dataset.config import DEFAULT_REPORT_PATH

router = APIRouter(prefix="/platform", tags=["Platform"])


@router.get("/stats", response_model=Dict[str, Any])
def get_public_platform_stats(db: Session = Depends(get_db)):
    """
    Public, unauthenticated aggregate counts for the landing page. Every
    value is a real live count from the database -- no invented numbers.
    A field is null (not a fabricated number) when there is nothing to
    report yet, so the frontend can render an honest "no data yet" state.
    """
    total_learners = db.query(User).filter(User.role == RoleEnum.student).count()
    total_lessons = db.query(Lesson).filter(Lesson.is_published.is_(True)).count()
    total_sign_attempts = db.query(SignAssessmentAttempt).count()

    report = ReportManager.load_report(DEFAULT_REPORT_PATH)
    model_accuracy: Optional[float] = None
    if report and report.get("test_samples", 0) > 0:
        model_accuracy = report.get("accuracy")

    return {
        "total_learners": total_learners,
        "total_lessons": total_lessons,
        "total_sign_attempts": total_sign_attempts,
        "model_accuracy": model_accuracy,
    }
