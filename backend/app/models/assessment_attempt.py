from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class SignAssessmentAttempt(Base):
    __tablename__ = "sign_assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    expected_sign = Column(String(50), nullable=False)
    predicted_sign = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.0, nullable=False)
    score = Column(Float, default=0.0, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    feedback = Column(Text, nullable=True)
    landmarks_data = Column(JSON, nullable=True)
    model_version = Column(String(50), default="v1.0.0-rf", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="sign_attempts")
    lesson = relationship("Lesson")
