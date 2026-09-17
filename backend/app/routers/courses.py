from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, require_instructor_or_admin, require_staff
from app.database.database import get_db
from app.models.course import Course
from app.models.lesson import Enrollment
from app.models.user import User, RoleEnum
from app.schemas.course import CourseCreate, CourseOut, CourseUpdate, EnrollmentOut, EnrolledCourseOut

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=list[CourseOut])
def list_courses(
    level: str | None = Query(None),
    published_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Course)
    if published_only and current_user.role != RoleEnum.admin:
        q = q.filter(Course.is_published.is_(True))
    if level:
        q = q.filter(Course.level == level)
    return q.order_by(Course.created_at.desc()).all()

@router.get("/enrolled", response_model=list[EnrolledCourseOut])
def enrolled_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.student:
        raise HTTPException(status_code=403, detail="Only learners can view enrolled courses")
    rows = (db.query(Enrollment)
            .join(Course, Course.id == Enrollment.course_id)
            .filter(Enrollment.user_id == current_user.id)
            .order_by(Enrollment.enrolled_at.desc())
            .all())
    return [{"enrollment_id": e.id, "course": e.course, "progress_percent": e.progress_percent, "enrolled_at": e.enrolled_at, "completed_at": e.completed_at} for e in rows]

@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not course.is_published and current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(require_instructor_or_admin)):
    if db.query(Course).filter(Course.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Course slug already exists")
    course = Course(**payload.model_dump(), instructor_id=current_user.id if current_user.role == RoleEnum.instructor else None)
    db.add(course); db.commit(); db.refresh(course)
    return course

@router.put("/{course_id}", response_model=CourseOut)
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_instructor_or_admin)):
    course = db.get(Course, course_id)
    if not course: raise HTTPException(404, "Course not found")
    if current_user.role == RoleEnum.instructor and course.instructor_id != current_user.id:
        raise HTTPException(403, "You can only manage your own courses")
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(course,k,v)
    db.commit(); db.refresh(course); return course

@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_instructor_or_admin)):
    course = db.get(Course, course_id)
    if not course: raise HTTPException(404, "Course not found")
    if current_user.role == RoleEnum.instructor and course.instructor_id != current_user.id:
        raise HTTPException(403, "You can only manage your own courses")
    db.delete(course); db.commit()

@router.get("/{course_id}/lessons")
def course_lessons(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.lesson import Lesson
    course = db.get(Course, course_id)
    if not course: raise HTTPException(404, "Course not found")
    q = db.query(Lesson).filter(Lesson.course_id == course_id)
    if current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}:
        q = q.filter(Lesson.is_published.is_(True))
    return q.order_by(Lesson.order_index).all()

@router.get("/{course_id}/lessons/{lesson_id}")
def course_lesson(course_id: int, lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.lesson import Lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not lesson or (not lesson.is_published and current_user.role not in {RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin}):
        raise HTTPException(404, "Lesson not found")
    return lesson

@router.post("/{course_id}/enroll", response_model=EnrollmentOut, status_code=201)
def enroll(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.student:
        raise HTTPException(403, "Only learners can enroll in courses")
    course = db.get(Course, course_id)
    if not course or not course.is_published: raise HTTPException(404, "Course not found")
    existing = db.query(Enrollment).filter_by(user_id=current_user.id, course_id=course_id).first()
    if existing: return existing
    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
    db.add(enrollment); db.commit(); db.refresh(enrollment); return enrollment
