from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class SignAssessmentSession(Base):
    """
    Groups a set of SignAssessmentAttempt rows into one completed assessment
    run (Single Sign / Multiple Sign Quiz / Alphabet / Mixed) with an
    aggregated score, so the results page can show a real summary instead
    of a per-attempt view.
    """
    __tablename__ = "sign_assessment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_type = Column(String(30), nullable=False, default="single")
    attempt_ids = Column(JSON, nullable=False, default=list)
    total_questions = Column(Integer, default=0, nullable=False)
    correct_count = Column(Integer, default=0, nullable=False)
    incorrect_count = Column(Integer, default=0, nullable=False)
    accuracy = Column(Float, default=0.0, nullable=False)
    average_confidence = Column(Float, default=0.0, nullable=False)
    strong_signs = Column(JSON, nullable=True)
    weak_signs = Column(JSON, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="sign_assessment_sessions")
