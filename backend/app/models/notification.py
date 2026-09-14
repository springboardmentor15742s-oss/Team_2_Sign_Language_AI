import enum

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class NotificationTypeEnum(str, enum.Enum):
    info = "info"
    success = "success"
    warning = "warning"
    achievement = "achievement"
    course = "course"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(String(500), nullable=False)
    type = Column(Enum(NotificationTypeEnum), default=NotificationTypeEnum.info, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
