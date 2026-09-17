from app.database.database import SessionLocal
from app.models.course import Course
from app.models.assessment import (
    Assessment,
    Question,
    QuestionTypeEnum,
)


TITLE = "Sign Language Fundamentals Assessment"


QUESTIONS = [
    {
        "question_text": 'Demonstrate the sign for letter "A"',
        "question_type": QuestionTypeEnum.gesture_recognition,
        "options": None,
        "correct_answer": "Letter A",
    },
    {
        "question_text": "Which letter is formed by extending the thumb and index finger into an L shape?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["A", "L", "V", "Y"],
        "correct_answer": "L",
    },
    {
        "question_text": 'Demonstrate the sign for letter "C"',
        "question_type": QuestionTypeEnum.gesture_recognition,
        "options": None,
        "correct_answer": "Letter C",
    },
    {
        "question_text": "Which sign commonly uses the index and middle fingers separated in a V shape?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["U", "V", "W", "R"],
        "correct_answer": "V",
    },
    {
        "question_text": "Which letter is signed by extending only the little finger from a fist?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["I", "J", "Y", "X"],
        "correct_answer": "I",
    },
    {
        "question_text": "Which letter uses a handshape similar to I but includes a tracing movement?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["J", "K", "L", "Z"],
        "correct_answer": "J",
    },
    {
        "question_text": "Which ASL alphabet sign is typically formed by curving the hand into a C shape?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["C", "O", "D", "G"],
        "correct_answer": "C",
    },
    {
        "question_text": "Which letter is formed by extending the thumb and little finger while folding the middle fingers?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["Y", "W", "V", "F"],
        "correct_answer": "Y",
    },
    {
        "question_text": "Which letter is generally traced in the air using the index finger?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["J", "Z", "X", "Q"],
        "correct_answer": "Z",
    },
    {
        "question_text": "Which letter uses three extended fingers: index, middle, and ring?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["W", "V", "U", "F"],
        "correct_answer": "W",
    },
    {
        "question_text": "What is fingerspelling mainly used for?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Spelling names and words",
            "Showing numbers only",
            "Expressing facial emotion",
            "Replacing all sign language",
        ],
        "correct_answer": "Spelling names and words",
    },
    {
        "question_text": "Why is palm orientation important when signing?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "It can change or clarify the sign",
            "It changes spoken volume",
            "It is only decorative",
            "It has no effect",
        ],
        "correct_answer": "It can change or clarify the sign",
    },
    {
        "question_text": "What should a learner do when two signs look visually similar?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Compare finger position and orientation",
            "Ignore the difference",
            "Use only spoken language",
            "Skip both signs",
        ],
        "correct_answer": "Compare finger position and orientation",
    },
    {
        "question_text": "Which pair is commonly visually similar in the alphabet?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["U and V", "A and Z", "B and Q", "C and X"],
        "correct_answer": "U and V",
    },
    {
        "question_text": "What helps improve camera-based gesture recognition?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Good lighting and a clear hand position",
            "Very dark lighting",
            "Keeping the hand outside the frame",
            "Covering the camera",
        ],
        "correct_answer": "Good lighting and a clear hand position",
    },
    {
        "question_text": "What does a higher prediction confidence generally indicate?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "The model is more confident in its prediction",
            "The camera is disabled",
            "The learner failed automatically",
            "The database is offline",
        ],
        "correct_answer": "The model is more confident in its prediction",
    },
    {
        "question_text": "Which SignSpeak feature identifies signs that need more practice?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Performance analytics",
            "Logout",
            "Password reset",
            "Course thumbnail",
        ],
        "correct_answer": "Performance analytics",
    },
    {
        "question_text": "What does the weak-sign analysis use?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Learner practice performance",
            "Random sign selection only",
            "Email address",
            "Profile picture",
        ],
        "correct_answer": "Learner practice performance",
    },
    {
        "question_text": "Which SignSpeak module provides camera-based sign prediction?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Practice",
            "Settings",
            "Notifications only",
            "Certificates only",
        ],
        "correct_answer": "Practice",
    },
    {
        "question_text": "What happens after a gesture prediction during practice?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Confidence and feedback are generated",
            "The account is deleted",
            "The course is removed",
            "The database is reset",
        ],
        "correct_answer": "Confidence and feedback are generated",
    },
    {
        "question_text": "What is a personalized learning plan based on?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Accuracy, weak signs, strong signs, and attempts",
            "Only the learner name",
            "Only the email address",
            "Random values",
        ],
        "correct_answer": "Accuracy, weak signs, strong signs, and attempts",
    },
    {
        "question_text": "What is the purpose of repeated sign practice?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Improve recognition consistency and accuracy",
            "Reduce learning progress",
            "Disable analytics",
            "Remove completed lessons",
        ],
        "correct_answer": "Improve recognition consistency and accuracy",
    },
    {
        "question_text": "What does SignSpeak store from practice sessions?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Attempts, confidence, detections, and results",
            "Only the learner password",
            "Only screenshots",
            "No practice data",
        ],
        "correct_answer": "Attempts, confidence, detections, and results",
    },
    {
        "question_text": "What is the main purpose of assessment gesture questions?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": [
            "Evaluate the learner's performed sign using the ML model",
            "Change the learner's email",
            "Create an admin account",
            "Delete practice history",
        ],
        "correct_answer": "Evaluate the learner's performed sign using the ML model",
    },
    {
        "question_text": "What score is required to pass this assessment?",
        "question_type": QuestionTypeEnum.multiple_choice,
        "options": ["50%", "60%", "70%", "100%"],
        "correct_answer": "70%",
    },
]


def seed():
    db = SessionLocal()

    try:
        course = (
            db.query(Course)
            .filter(
                Course.slug
                == "sign-language-fundamentals"
            )
            .first()
        )

        if not course:
            raise RuntimeError(
                "Sign Language Fundamentals course not found. "
                "Run seed_courses first."
            )

        assessment = (
            db.query(Assessment)
            .filter(
                Assessment.title == TITLE
            )
            .first()
        )

        if not assessment:
            assessment = Assessment(
                course_id=course.id,
                title=TITLE,
                description=(
                    "Evaluate alphabet knowledge, signing fundamentals, "
                    "and practical sign recognition."
                ),
                passing_score=70,
                time_limit_minutes=15,
                is_published=1,
            )

            db.add(assessment)
            db.flush()

        existing = (
            db.query(Question)
            .filter(
                Question.assessment_id
                == assessment.id
            )
            .count()
        )

        if existing == 0:
            for index, item in enumerate(
                QUESTIONS,
                start=1,
            ):
                db.add(
                    Question(
                        assessment_id=assessment.id,
                        question_text=item["question_text"],
                        question_type=item["question_type"],
                        options=item["options"],
                        correct_answer=item["correct_answer"],
                        points=1,
                        order_index=index,
                    )
                )

        db.commit()

        count = (
            db.query(Question)
            .filter(
                Question.assessment_id
                == assessment.id
            )
            .count()
        )

        print(
            f"Assessment seed complete: "
            f"{count} questions."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()
