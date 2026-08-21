from app.database.database import SessionLocal
from app.models.user import User
from app.models.assessment_attempt import SignAssessmentAttempt
from app.models.assessment_session import SignAssessmentSession

db = SessionLocal()
for u in db.query(User).all()[:10]:
    user_attempts = db.query(SignAssessmentAttempt).filter(SignAssessmentAttempt.user_id == u.id).all()
    user_sessions = db.query(SignAssessmentSession).filter(SignAssessmentSession.user_id == u.id).all()
    corr = sum(1 for a in user_attempts if a.is_correct)
    tot = len(user_attempts)
    acc = round((corr/tot)*100, 2) if tot else 0
    print(f"User {u.id} ({u.email}, {u.role.value}): {tot} attempts ({corr} correct, {acc}%), {len(user_sessions)} sessions")
    for s in user_sessions:
        print(f"   Session {s.id}: accuracy={s.accuracy}%, correct={s.correct_count}/{s.total_questions}")

print("\nAll Sessions in DB:")
for s in db.query(SignAssessmentSession).all():
    print(f"User {s.user_id}, Session {s.id}: type={s.assessment_type}, accuracy={s.accuracy}%, correct={s.correct_count}/{s.total_questions}, completed_at={s.completed_at}")

print("\nTotal attempts across entire DB:", db.query(SignAssessmentAttempt).count())
corr_all = db.query(SignAssessmentAttempt).filter(SignAssessmentAttempt.is_correct == True).count()
print(f"Total correct: {corr_all}, overall: {round((corr_all/db.query(SignAssessmentAttempt).count())*100, 2)}%")
