from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field

class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    assessment_id: int
    question_text: str
    question_type: str
    options: Optional[list[Any]] = None
    image_url: Optional[str] = None
    points: int
    order_index: int

class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: Optional[int]
    title: str
    description: Optional[str]
    passing_score: int
    time_limit_minutes: int
    is_published: int
    created_at: Optional[datetime]

class AssessmentDetail(AssessmentOut):
    questions: list[QuestionOut] = []

class AssessmentSubmit(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)

class AssessmentResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    assessment_id: int
    score: float
    total_points: int
    earned_points: int
    passed: int
    answers: Optional[dict[str, Any]]
    started_at: Optional[datetime]
    submitted_at: Optional[datetime]
