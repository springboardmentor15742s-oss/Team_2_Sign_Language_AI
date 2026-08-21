from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.deps import require_admin
from app.core.security import hash_password
from app.database.database import get_db
from app.models.user import User, RoleEnum
from app.models.course import Course
from app.models.assessment import Assessment
from app.models.lesson import Lesson
from app.models.assessment_attempt import SignAssessmentAttempt
from app.models.assessment_session import SignAssessmentSession
from app.models.activity_log import ActivityLog, AdminLog
from app.schemas.admin import RoleUpdate, UserStatusUpdate, AdminUserCreate
from app.schemas.user import UserOut
from app.services.audit_service import log_admin_action

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active.is_(True)).count(),
        "learners": db.query(User).filter(User.role == RoleEnum.student).count(),
        "instructors": db.query(User).filter(User.role == RoleEnum.instructor).count(),
        "accessibility_trainers": db.query(User).filter(User.role == RoleEnum.accessibility_trainer).count(),
        "courses": db.query(Course).count(),
        "lessons": db.query(Lesson).count(),
        "assessments": db.query(Assessment).count(),
        "sign_assessments_completed": db.query(SignAssessmentSession).count(),
        "sign_attempts_total": db.query(SignAssessmentAttempt).count(),
    }

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/users/activity", response_model=List[Dict[str, Any]])
def list_users_with_activity(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """
    Per-user activity rollup for the admin monitoring page: last login,
    assessments completed, and real accuracy from SignAssessmentAttempt --
    so the admin can see who is actually working and how they're doing.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    if not users:
        return []

    user_ids = [u.id for u in users]

    session_counts = dict(
        db.query(SignAssessmentSession.user_id, func.count(SignAssessmentSession.id))
        .filter(SignAssessmentSession.user_id.in_(user_ids))
        .group_by(SignAssessmentSession.user_id)
        .all()
    )
    attempt_stats = dict(
        db.query(
            SignAssessmentAttempt.user_id,
            func.count(SignAssessmentAttempt.id),
        )
        .filter(SignAssessmentAttempt.user_id.in_(user_ids))
        .group_by(SignAssessmentAttempt.user_id)
        .all()
    )
    correct_stats = dict(
        db.query(SignAssessmentAttempt.user_id, func.count(SignAssessmentAttempt.id))
        .filter(SignAssessmentAttempt.user_id.in_(user_ids), SignAssessmentAttempt.is_correct.is_(True))
        .group_by(SignAssessmentAttempt.user_id)
        .all()
    )

    result = []
    for u in users:
        total = attempt_stats.get(u.id, 0)
        correct = correct_stats.get(u.id, 0)
        result.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "last_login_at": u.last_login_at,
            "created_at": u.created_at,
            "assessments_completed": session_counts.get(u.id, 0),
            "sign_attempts": total,
            "accuracy": round((correct / total) * 100, 2) if total else 0.0,
            "xp_points": u.xp_points,
            "current_streak": u.current_streak,
        })
    return result


@router.get("/activity", response_model=List[Dict[str, Any]])
def list_recent_activity(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Combined learner activity log + admin action log, most recent first."""
    if limit < 1 or limit > 200:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "limit must be between 1 and 200.")

    activity_rows = (
        db.query(ActivityLog, User.full_name, User.email)
        .join(User, User.id == ActivityLog.user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    admin_rows = (
        db.query(AdminLog, User.full_name, User.email)
        .outerjoin(User, User.id == AdminLog.admin_id)
        .order_by(AdminLog.created_at.desc())
        .limit(limit)
        .all()
    )

    combined = [
        {
            "source": "activity",
            "action": log.action,
            "actor_name": name,
            "actor_email": email,
            "meta": log.meta,
            "created_at": log.created_at,
        }
        for log, name, email in activity_rows
    ] + [
        {
            "source": "admin",
            "action": log.action,
            "actor_name": name or "System",
            "actor_email": email,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "meta": log.meta,
            "created_at": log.created_at,
        }
        for log, name, email in admin_rows
    ]
    combined.sort(key=lambda r: r["created_at"], reverse=True)
    return combined[:limit]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_staff_user(payload: AdminUserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if db.query(User).filter(User.email == payload.email).first(): raise HTTPException(409, "Email is already registered")
    user = User(full_name=payload.full_name, email=payload.email, hashed_password=hash_password(payload.password), role=payload.role)
    db.add(user)
    db.flush()
    log_admin_action(db, current_user.id, "USER_CREATED", target_type="user", target_id=user.id, meta=f"role={payload.role.value}")
    db.commit(); db.refresh(user); return user

@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_role(user_id: int, payload: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user: raise HTTPException(404, "User not found")
    if user.id == current_user.id and payload.role != RoleEnum.admin: raise HTTPException(400, "You cannot remove your own admin role")
    previous_role = user.role.value
    user.role = payload.role
    log_admin_action(db, current_user.id, "ROLE_UPDATED", target_type="user", target_id=user.id, meta=f"{previous_role} -> {payload.role.value}")
    db.commit(); db.refresh(user); return user

@router.patch("/users/{user_id}/status", response_model=UserOut)
def update_status(user_id: int, payload: UserStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user: raise HTTPException(404, "User not found")
    if user.id == current_user.id and not payload.is_active: raise HTTPException(400, "You cannot deactivate your own admin account")
    user.is_active = payload.is_active
    log_admin_action(db, current_user.id, "STATUS_UPDATED", target_type="user", target_id=user.id, meta=f"is_active={payload.is_active}")
    db.commit(); db.refresh(user); return user
