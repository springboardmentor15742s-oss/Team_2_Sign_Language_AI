from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, require_instructor_or_admin
from app.database.database import get_db
from app.models.lesson import Lesson, LessonCompletion, Enrollment
from app.models.course import Course
from app.models.user import User, RoleEnum
from app.schemas.lesson import LessonCreate, LessonOut, LessonUpdate, LessonCompletionOut

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson or (not lesson.is_published and current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}):
        raise HTTPException(404, "Lesson not found")
    return lesson

@router.post("/{lesson_id}/complete", response_model=LessonCompletionOut)
def complete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.student:
        raise HTTPException(403, "Only learners can complete lessons")
    lesson = db.get(Lesson, lesson_id)
    if not lesson or not lesson.is_published: raise HTTPException(404, "Lesson not found")
    enrollment = db.query(Enrollment).filter_by(user_id=current_user.id, course_id=lesson.course_id).first()
    if not enrollment: raise HTTPException(403, "Enroll in the course before completing lessons")
    completion = db.query(LessonCompletion).filter_by(user_id=current_user.id, lesson_id=lesson_id).first()
    if not completion:
        completion = LessonCompletion(user_id=current_user.id, lesson_id=lesson_id)
        db.add(completion)
    db.flush()
    total = db.query(Lesson).filter(Lesson.course_id == lesson.course_id, Lesson.is_published.is_(True)).count()
    done = db.query(LessonCompletion).join(Lesson, Lesson.id == LessonCompletion.lesson_id).filter(
        LessonCompletion.user_id == current_user.id, Lesson.course_id == lesson.course_id
    ).count()
    enrollment.progress_percent = round((done / total) * 100) if total else 0
    if enrollment.progress_percent >= 100: enrollment.completed_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(completion); return completion

@router.get("/{lesson_id}/practice")
def get_practice(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson: raise HTTPException(404, "Lesson not found")
    from app.models.practice import PracticeSession
    return db.query(PracticeSession).filter_by(user_id=current_user.id, lesson_id=lesson_id).order_by(PracticeSession.started_at.desc()).all()

@router.post("/course/{course_id}", response_model=LessonOut, status_code=201)
def create_lesson(course_id: int, payload: LessonCreate, db: Session = Depends(get_db), current_user: User = Depends(require_instructor_or_admin)):
    course = db.get(Course, course_id)
    if not course: raise HTTPException(404, "Course not found")
    if current_user.role == RoleEnum.instructor and course.instructor_id != current_user.id:
        raise HTTPException(403, "You can only manage your own courses")
    lesson = Lesson(course_id=course_id, **payload.model_dump())
    db.add(lesson); db.commit(); db.refresh(lesson); return lesson

@router.put("/{lesson_id}", response_model=LessonOut)
def update_lesson(lesson_id: int, payload: LessonUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_instructor_or_admin)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson: raise HTTPException(404, "Lesson not found")
    course = db.get(Course, lesson.course_id)
    if current_user.role == RoleEnum.instructor and (not course or course.instructor_id != current_user.id):
        raise HTTPException(403, "You can only manage lessons in your own courses")
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(lesson,k,v)
    db.commit(); db.refresh(lesson); return lesson
