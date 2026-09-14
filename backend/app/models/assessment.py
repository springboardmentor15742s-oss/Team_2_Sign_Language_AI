import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
    Enum,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class QuestionTypeEnum(str, enum.Enum):
    multiple_choice = "multiple_choice"
    gesture_recognition = "gesture_recognition"
    true_false = "true_false"


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    passing_score = Column(Integer, default=70, nullable=False)
    time_limit_minutes = Column(Integer, default=15, nullable=False)
    is_published = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionTypeEnum), default=QuestionTypeEnum.multiple_choice, nullable=False)
    options = Column(JSON, nullable=True)  # list of strings for multiple_choice
    correct_answer = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)
    points = Column(Integer, default=1, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, default=0.0, nullable=False)
    total_points = Column(Integer, default=0, nullable=False)
    earned_points = Column(Integer, default=0, nullable=False)
    passed = Column(Integer, default=0, nullable=False)
    answers = Column(JSON, nullable=True)  # {question_id: submitted_answer}
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="assessment_results")
    assessment = relationship("Assessment", back_populates="results")
