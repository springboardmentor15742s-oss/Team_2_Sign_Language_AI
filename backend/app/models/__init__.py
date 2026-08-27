from app.database.database import Base  # noqa: F401

from app.models.user import User, PasswordResetToken  # noqa: F401
from app.models.course import Course, Category  # noqa: F401
from app.models.lesson import Lesson, Enrollment, LessonCompletion  # noqa: F401
from app.models.practice import PracticeSession  # noqa: F401
from app.models.assessment import Assessment, Question, AssessmentResult  # noqa: F401
from app.models.certificate import Certificate  # noqa: F401
from app.models.achievement import Achievement, UserAchievement  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.activity_log import ActivityLog, AdminLog  # noqa: F401
