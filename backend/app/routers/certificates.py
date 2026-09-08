from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.database import get_db
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.lesson import Enrollment
from app.models.user import RoleEnum, User


router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"],
)


def serialize_certificate(certificate: Certificate):
    return {
        "id": certificate.id,
        "user_id": certificate.user_id,
        "course_id": certificate.course_id,
        "certificate_number": certificate.certificate_number,
        "title": certificate.title,
        "file_url": certificate.file_url,
        "issued_at": certificate.issued_at,
        "course": {
            "id": certificate.course.id,
            "title": certificate.course.title,
            "level": (
                certificate.course.level.value
                if certificate.course.level
                else None
            ),
        }
        if certificate.course
        else None,
    }


@router.get("")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return certificates earned by the currently authenticated learner.
    """

    certificates = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )

    return [
        serialize_certificate(certificate)
        for certificate in certificates
    ]


@router.get("/{certificate_id}")
def get_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return one certificate belonging to the current learner.
    """

    certificate = (
        db.query(Certificate)
        .filter(
            Certificate.id == certificate_id,
            Certificate.user_id == current_user.id,
        )
        .first()
    )

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found",
        )

    return serialize_certificate(certificate)


@router.post("/course/{course_id}/generate")
def generate_course_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a certificate after the learner completes a course.

    Certificate eligibility currently requires:
    - student/learner account
    - enrollment in the course
    - 100% course progress
    - completed_at set on the enrollment
    """

    if current_user.role != RoleEnum.student:
        raise HTTPException(
            status_code=403,
            detail="Only learners can generate course certificates",
        )

    course = db.get(Course, course_id)

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course_id,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="You must enroll in this course before earning a certificate",
        )

    if (
        enrollment.progress_percent < 100
        or enrollment.completed_at is None
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Complete all course lessons before generating "
                "the certificate"
            ),
        )

    # Do not generate duplicate certificates.
    existing_certificate = (
        db.query(Certificate)
        .filter(
            Certificate.user_id == current_user.id,
            Certificate.course_id == course_id,
        )
        .first()
    )

    if existing_certificate:
        return {
            "message": "Certificate already earned",
            "certificate": serialize_certificate(
                existing_certificate
            ),
        }

    certificate_number = (
        f"SIGNSPEAK-{course_id}-"
        f"{current_user.id}-"
        f"{uuid4().hex[:10].upper()}"
    )

    certificate = Certificate(
        user_id=current_user.id,
        course_id=course.id,
        certificate_number=certificate_number,
        title=f"Certificate of Completion - {course.title}",
        file_url=None,
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    return {
        "message": "Certificate generated successfully",
        "certificate": serialize_certificate(certificate),
    }