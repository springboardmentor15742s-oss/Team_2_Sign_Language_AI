from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.course import LevelEnum

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=220)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: LevelEnum = LevelEnum.beginner
    category_id: Optional[int] = None
    duration_minutes: int = Field(0, ge=0)
    is_published: bool = True

class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    slug: Optional[str] = Field(None, min_length=2, max_length=220)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: Optional[LevelEnum] = None
    category_id: Optional[int] = None
    duration_minutes: Optional[int] = Field(None, ge=0)
    is_published: Optional[bool] = None

class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    slug: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    level: LevelEnum
    category_id: Optional[int]
    instructor_id: Optional[int]
    duration_minutes: int
    rating: float
    is_published: bool
    created_at: Optional[datetime]

class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    course_id: int
    progress_percent: int
    enrolled_at: Optional[datetime]
    completed_at: Optional[datetime]


class EnrolledCourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    enrollment_id: int
    course: CourseOut
    progress_percent: int
    enrolled_at: Optional[datetime]
    completed_at: Optional[datetime]
