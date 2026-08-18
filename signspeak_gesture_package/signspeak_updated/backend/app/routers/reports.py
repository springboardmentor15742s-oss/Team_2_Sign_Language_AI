from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.database.database import get_db
from app.models.user import User, RoleEnum
from app.models.lesson import LessonCompletion, Enrollment
from app.models.assessment import AssessmentResult
from app.models.practice import PracticeSession

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

def _target_user_id(current_user: User, user_id: int | None) -> int | None:
    staff = {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}
    if current_user.role == RoleEnum.student:
        return current_user.id
    return user_id

@router.get("/learning")
def learning_report(user_id: int | None = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uid = _target_user_id(current_user, user_id)
    if current_user.role != RoleEnum.student and uid is None:
        uid = None
    q = db.query(Enrollment)
    if uid is not None: q = q.filter(Enrollment.user_id == uid)
    enrollments = q.all()
    return {"user_id": uid, "courses": [{"course_id": e.course_id, "progress_percent": e.progress_percent, "completed": e.completed_at is not None} for e in enrollments]}

@router.get("/assessment")
def assessment_report(user_id: int | None = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uid = _target_user_id(current_user, user_id)
    q = db.query(AssessmentResult)
    if uid is not None: q = q.filter(AssessmentResult.user_id == uid)
    results = q.all()
    avg = round(sum(r.score for r in results) / len(results), 2) if results else 0
    return {"user_id": uid, "attempts": len(results), "average_score": avg, "passed": sum(int(r.passed) for r in results)}

@router.get("/accuracy")
def accuracy_report(user_id: int | None = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uid = _target_user_id(current_user, user_id)
    q = db.query(PracticeSession)
    if uid is not None: q = q.filter(PracticeSession.user_id == uid)
    sessions = q.all()
    avg_conf = round(sum(s.average_confidence for s in sessions) / len(sessions), 3) if sessions else 0
    attempts = sum(s.attempts for s in sessions)
    successes = sum(s.successful_attempts for s in sessions)
    return {"user_id": uid, "sessions": len(sessions), "average_confidence": avg_conf, "attempts": attempts, "successful_attempts": successes, "accuracy_percent": round(successes / attempts * 100, 2) if attempts else 0}

@router.get("/progress")
def progress_report(user_id: int | None = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uid = _target_user_id(current_user, user_id)
    if uid is not None:
        completed = db.query(LessonCompletion).filter(LessonCompletion.user_id == uid).count()
        practice = db.query(PracticeSession).filter(PracticeSession.user_id == uid).count()
        return {"user_id": uid, "lessons_completed": completed, "practice_sessions": practice}
    return {"learners": db.query(User).filter(User.role == RoleEnum.student).count(), "lessons_completed": db.query(LessonCompletion).count(), "practice_sessions": db.query(PracticeSession).count()}
