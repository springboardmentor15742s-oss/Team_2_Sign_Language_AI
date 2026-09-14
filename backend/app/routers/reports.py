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

@router.get("/sign-performance")
def sign_performance_report(
    user_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uid = _target_user_id(
        current_user,
        user_id
    )

    query = db.query(
        PracticeSession
    )

    if uid is not None:
        query = query.filter(
            PracticeSession.user_id == uid
        )

    sessions = query.all()

    sign_stats = {}
    confusion_map = {}

    total_detection_attempts = 0
    total_correct = 0

    for session in sessions:

        detections = (
            session.detections
            if isinstance(
                session.detections,
                list
            )
            else []
        )

        for detection in detections:

            expected = str(
                detection.get(
                    "target_gesture",
                    detection.get(
                        "gesture",
                        ""
                    )
                )
            ).upper().strip()

            predicted = str(
                detection.get(
                    "predicted_gesture",
                    detection.get(
                        "predicted_sign",
                        ""
                    )
                )
            ).upper().strip()

            if not expected:
                continue

            confidence = float(
                detection.get(
                    "confidence",
                    0
                ) or 0
            )

            correct = bool(
                detection.get(
                    "correct",
                    expected == predicted
                )
            )

            if expected not in sign_stats:

                sign_stats[expected] = {
                    "sign": expected,
                    "attempts": 0,
                    "correct": 0,
                    "confidence_total": 0.0,
                }

            stats = sign_stats[
                expected
            ]

            stats["attempts"] += 1

            stats[
                "confidence_total"
            ] += confidence

            if correct:
                stats["correct"] += 1

            total_detection_attempts += 1

            if correct:
                total_correct += 1

            # -----------------------------------------
            # CONFUSION ANALYSIS
            # -----------------------------------------

            if (
                predicted
                and
                predicted != expected
            ):

                key = (
                    expected,
                    predicted
                )

                confusion_map[
                    key
                ] = (
                    confusion_map.get(
                        key,
                        0
                    ) + 1
                )

    # =============================================
    # BUILD PER-SIGN PERFORMANCE
    # =============================================

    sign_performance = []

    for sign, stats in (
        sign_stats.items()
    ):

        attempts = (
            stats["attempts"]
        )

        correct = (
            stats["correct"]
        )

        accuracy = (
            round(
                (
                    correct /
                    attempts
                ) * 100,
                2
            )
            if attempts
            else 0
        )

        avg_confidence = (
            round(
                stats[
                    "confidence_total"
                ] /
                attempts,
                2
            )
            if attempts
            else 0
        )

        sign_performance.append(
            {
                "sign": sign,
                "attempts": attempts,
                "correct": correct,
                "incorrect": (
                    attempts -
                    correct
                ),
                "accuracy_percent": accuracy,
                "average_confidence": avg_confidence,
            }
        )

    # =============================================
    # SORT PERFORMANCE
    # =============================================

    sign_performance.sort(
        key=lambda item: (
            item[
                "accuracy_percent"
            ],
            -item[
                "attempts"
            ],
        )
    )

    # =============================================
    # WEAK SIGNS
    # Accuracy below 70%
    # =============================================

    weak_signs = [
        item["sign"]
        for item in sign_performance
        if (
            item["attempts"] >= 1
            and item["accuracy_percent"] < 70
        )
    ][:5]

    # =============================================
    # STRONG SIGNS
    # Accuracy 80% or above
    # =============================================

    strong_signs = [
        item["sign"]
        for item in sorted(
            sign_performance,
            key=lambda item: (
                item["accuracy_percent"],
                item["attempts"],
            ),
            reverse=True,
        )
        if (
            item["attempts"] >= 1
            and item["accuracy_percent"] >= 80
        )
    ][:5]

    # =============================================
    # CONFUSIONS
    # =============================================

    confusions = [
        {
            "expected": expected,
            "predicted": predicted,
            "count": count,
        }
        for (
            expected,
            predicted
        ), count in sorted(
            confusion_map.items(),
            key=lambda item:
                item[1],
            reverse=True,
        )
    ]

    overall_accuracy = (
        round(
            (
                total_correct /
                total_detection_attempts
            ) * 100,
            2
        )
        if total_detection_attempts
        else 0
    )

    return {
        "user_id": uid,
        "total_sessions": len(
            sessions
        ),
        "total_detection_attempts":
            total_detection_attempts,
        "total_correct":
            total_correct,
        "overall_accuracy_percent":
            overall_accuracy,
        "signs":
            sign_performance,
        "weak_signs":
            weak_signs,
        "strong_signs":
            strong_signs,
        "confusions":
            confusions[:10],
    }