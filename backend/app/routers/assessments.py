from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, require_staff
from app.database.database import get_db
from app.models.assessment import Assessment, Question, AssessmentResult
from app.models.user import User, RoleEnum
from app.schemas.assessment import AssessmentOut, AssessmentDetail, AssessmentSubmit, AssessmentResultOut

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("", response_model=list[AssessmentOut])
def list_assessments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Assessment)
    if current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}:
        q = q.filter(Assessment.is_published == 1)
    return q.order_by(Assessment.created_at.desc()).all()

@router.get("/{assessment_id}", response_model=AssessmentDetail)
def get_assessment(assessment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = db.get(Assessment, assessment_id)
    if not a or (a.is_published != 1 and current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}):
        raise HTTPException(404, "Assessment not found")
    # Never expose correct answers to learners.
    questions = db.query(Question).filter(Question.assessment_id == assessment_id).order_by(Question.order_index).all()
    return AssessmentDetail.model_validate({**a.__dict__, "questions": questions})

@router.post("/{assessment_id}/submit", response_model=AssessmentResultOut)
def submit_assessment(assessment_id: int, payload: AssessmentSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.student:
        raise HTTPException(403, "Only learners can submit assessments")
    a = db.get(Assessment, assessment_id)
    if not a or a.is_published != 1: raise HTTPException(404, "Assessment not found")
    questions = db.query(Question).filter(Question.assessment_id == assessment_id).all()
    if not questions: raise HTTPException(400, "Assessment has no questions")
    earned = 0; total = sum(q.points for q in questions)
    for q in questions:
        answer = payload.answers.get(str(q.id), payload.answers.get(q.id))
        if answer is not None and str(answer).strip().lower() == str(q.correct_answer).strip().lower(): earned += q.points
    score = round((earned / total) * 100, 2) if total else 0
    result = AssessmentResult(user_id=current_user.id, assessment_id=assessment_id, score=score, total_points=total, earned_points=earned, passed=1 if score >= a.passing_score else 0, answers=payload.answers, submitted_at=datetime.now(timezone.utc))
    db.add(result); db.commit(); db.refresh(result); return result

@router.get("/{assessment_id}/results", response_model=list[AssessmentResultOut])
def get_results(assessment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(AssessmentResult).filter(AssessmentResult.assessment_id == assessment_id)
    if current_user.role == RoleEnum.student:
        q = q.filter(AssessmentResult.user_id == current_user.id)
    elif current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}:
        raise HTTPException(403, "You do not have permission to view assessment results")
    return q.order_by(AssessmentResult.submitted_at.desc()).all()
