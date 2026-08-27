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
from app.schemas.admin import RoleUpdate, UserStatusUpdate, AdminUserCreate
from app.schemas.user import UserOut

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
    }

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_staff_user(payload: AdminUserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if db.query(User).filter(User.email == payload.email).first(): raise HTTPException(409, "Email is already registered")
    user = User(full_name=payload.full_name, email=payload.email, hashed_password=hash_password(payload.password), role=payload.role)
    db.add(user); db.commit(); db.refresh(user); return user

@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_role(user_id: int, payload: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user: raise HTTPException(404, "User not found")
    if user.id == current_user.id and payload.role != RoleEnum.admin: raise HTTPException(400, "You cannot remove your own admin role")
    user.role = payload.role; db.commit(); db.refresh(user); return user

@router.patch("/users/{user_id}/status", response_model=UserOut)
def update_status(user_id: int, payload: UserStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user: raise HTTPException(404, "User not found")
    if user.id == current_user.id and not payload.is_active: raise HTTPException(400, "You cannot deactivate your own admin account")
    user.is_active = payload.is_active; db.commit(); db.refresh(user); return user
