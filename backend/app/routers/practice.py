from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.core.deps import require_learner
from app.database.database import get_db
from app.models.practice import PracticeSession
from app.models.user import User

router = APIRouter(prefix="/practice", tags=["Practice"])

class PracticeStart(BaseModel):
    lesson_id: int | None = None
    target_gesture: str | None = Field(None, max_length=100)

class PracticeFinish(BaseModel):
    duration_seconds: int = Field(0, ge=0)
    average_confidence: float = Field(0, ge=0, le=1)
    attempts: int = Field(0, ge=0)
    successful_attempts: int = Field(0, ge=0)
    detections: list[dict] | None = None

@router.post("/sessions")
def start_session(payload: PracticeStart, db: Session = Depends(get_db), current_user: User = Depends(require_learner)):
    s = PracticeSession(user_id=current_user.id, lesson_id=payload.lesson_id, target_gesture=payload.target_gesture)
    db.add(s); db.commit(); db.refresh(s); return s

@router.patch("/sessions/{session_id}")
def finish_session(session_id: int, payload: PracticeFinish, db: Session = Depends(get_db), current_user: User = Depends(require_learner)):
    s = db.get(PracticeSession, session_id)
    if not s or s.user_id != current_user.id: raise HTTPException(404, "Practice session not found")
    s.ended_at = datetime.now(timezone.utc)
    for k,v in payload.model_dump().items(): setattr(s,k,v)
    db.commit(); db.refresh(s); return s

@router.get("/sessions")
def history(db: Session = Depends(get_db), current_user: User = Depends(require_learner)):
    return db.query(PracticeSession).filter(PracticeSession.user_id == current_user.id).order_by(PracticeSession.started_at.desc()).all()
