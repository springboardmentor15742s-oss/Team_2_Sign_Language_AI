from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class LessonCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    order_index: int = Field(0, ge=0)
    duration_minutes: int = Field(0, ge=0)
    is_published: bool = True

class LessonUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, ge=0)
    is_published: Optional[bool] = None

class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: int
    title: str
    description: Optional[str]
    video_url: Optional[str]
    content: Optional[str]
    order_index: int
    duration_minutes: int
    is_published: bool
    created_at: Optional[datetime]

class LessonCompletionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    lesson_id: int
    completed_at: Optional[datetime]
