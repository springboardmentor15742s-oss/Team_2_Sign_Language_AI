import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean, String
from sqlalchemy.dialects.postgresql import UUID
from app.database.postgres import Base


class BaseModel(Base):
    """
    Abstract SQLAlchemy Base Model for SignLearn architecture.
    All future domain models (Users, Courses, Signs, Assessments, etc.) MUST inherit this model.
    """
    __abstract__ = True

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        nullable=False,
        doc="Unique primary key identifier"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Timestamp of entity creation"
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Timestamp of last update"
    )

    is_deleted = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Soft-deletion flag for compliance & audit"
    )

    created_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="Optional UUID of user who created this entity"
    )

    updated_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="Optional UUID of user who updated this entity"
    )
