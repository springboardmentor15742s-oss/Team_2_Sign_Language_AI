import logging
from app.database.database import Base, engine, SessionLocal
import app.models  # noqa: F401
from app.models.user import User, RoleEnum
from app.models.course import Course, Category, LevelEnum
from app.models.lesson import Lesson
from app.models.achievement import Achievement
from app.core.security import hash_password
from app.core.config import settings
from app.services.gamification_service import ACHIEVEMENT_DEFINITIONS

logger = logging.getLogger(__name__)


def init_db() -> None:
    # 1. Create tables if they do not exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized.")

    db = SessionLocal()
    try:
        # 2. Guarantee at least one Administrator account exists (Startup-Safe Admin Seed)
        admin_email = (settings.ADMIN_EMAIL or "admin@signspeak.com").strip().lower()
        admin_password = settings.ADMIN_PASSWORD or "admin123"
        admin_name = settings.ADMIN_FULL_NAME or "SignSpeak Administrator"

        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            # Also check if any admin exists at all
            any_admin = db.query(User).filter(User.role == RoleEnum.admin).first()
            if not any_admin:
                logger.info(f"Provisioning initial platform administrator: {admin_email}")
                admin_user = User(
                    full_name=admin_name,
                    email=admin_email,
                    hashed_password=hash_password(admin_password),
                    role=RoleEnum.admin,
                    is_active=True,
                    bio="Administrator account for SignSpeak AI Platform",
                )
                db.add(admin_user)
                db.commit()
                db.refresh(admin_user)
        else:
            if existing_admin.role != RoleEnum.admin:
                existing_admin.role = RoleEnum.admin
                db.commit()

        # 3. Seed demo student and course content if database has no courses
        if db.query(Course).count() == 0:
            logger.info("Seeding initial foundational courses and categories...")

            # Check or create demo student
            student_email = "student@signspeak.com"
            student_user = db.query(User).filter(User.email == student_email).first()
            if not student_user:
                student_user = User(
                    full_name="Demo Student",
                    email=student_email,
                    hashed_password=hash_password("student123"),
                    role=RoleEnum.student,
                    is_active=True,
                    bio="Learner account for SignSpeak platform testing",
                )
                db.add(student_user)
                db.commit()
                db.refresh(student_user)

            # Get an admin user to be the instructor
            instructor_user = db.query(User).filter(User.role == RoleEnum.admin).first()
            instructor_id = instructor_user.id if instructor_user else None

            # Category
            category = Category(
                name="ASL Basics",
                slug="asl-basics",
                description="American Sign Language foundational skills",
            )
            db.add(category)
            db.commit()
            db.refresh(category)

            # Course
            course = Course(
                title="ASL Alphabet & Fundamentals",
                slug="asl-alphabet-fundamentals",
                description="Learn the basics of ASL fingerspelling and fundamental greetings.",
                thumbnail_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                level=LevelEnum.beginner,
                category_id=category.id,
                instructor_id=instructor_id,
                duration_minutes=45,
                rating=4.9,
                is_published=True,
            )
            db.add(course)
            db.commit()
            db.refresh(course)

            # Lessons
            lesson1 = Lesson(
                course_id=course.id,
                title="Letters A through E",
                description="Master the fingerspelling of the first five letters of the alphabet.",
                content="Practice hand gestures for A, B, C, D, and E with real-time feedback.",
                order_index=1,
                duration_minutes=15,
                is_published=True,
            )
            lesson2 = Lesson(
                course_id=course.id,
                title="Letters F through J",
                description="Learn the next set of alphabetic signs.",
                content="Practice hand gestures for F, G, H, I, and J with real-time feedback.",
                order_index=2,
                duration_minutes=15,
                is_published=True,
            )
            db.add_all([lesson1, lesson2])
            db.commit()

            logger.info("Seed data creation completed successfully.")

        # 4. Achievement definitions
        if db.query(Achievement).count() == 0:
            logger.info("Seeding achievement definitions...")
            db.add_all([Achievement(**definition) for definition in ACHIEVEMENT_DEFINITIONS])
            db.commit()

    except Exception as e:
        logger.error(f"Error during db initialization: {e}")
        db.rollback()
    finally:
        db.close()
