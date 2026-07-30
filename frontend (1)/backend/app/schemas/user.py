from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, Field


class RoleEnum(str, Enum):
    student = "student"
    instructor = "instructor"
    admin = "admin"


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: RoleEnum = RoleEnum.student


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: RoleEnum
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    xp_points: int
    current_streak: int
    created_at: datetime


class UserPublic(BaseModel):
    """Minimal public-safe user shape, e.g. for leaderboard rows."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    avatar_url: Optional[str] = None
    xp_points: int
