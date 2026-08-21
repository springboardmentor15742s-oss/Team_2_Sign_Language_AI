from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.user import RoleEnum

class RoleUpdate(BaseModel):
    role: RoleEnum

class UserStatusUpdate(BaseModel):
    is_active: bool

class AdminUserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: str
    password: str = Field(..., min_length=8, max_length=128)
    role: RoleEnum = RoleEnum.student
