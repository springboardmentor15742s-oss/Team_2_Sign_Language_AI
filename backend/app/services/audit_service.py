"""
Thin write-side helpers for the existing (previously unused) ActivityLog /
AdminLog models. Never raises -- audit logging must never break the request
it's attached to.
"""
import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog, AdminLog

logger = logging.getLogger(__name__)


def log_activity(db: Session, user_id: int, action: str, meta: Optional[str] = None) -> None:
    try:
        db.add(ActivityLog(user_id=user_id, action=action, meta=(meta or "")[:1000]))
    except Exception as e:
        logger.warning(f"Failed to write activity log ({action}): {e}")


def log_admin_action(
    db: Session,
    admin_id: Optional[int],
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    meta: Optional[str] = None,
) -> None:
    try:
        db.add(AdminLog(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            meta=(meta or "")[:1000],
        ))
    except Exception as e:
        logger.warning(f"Failed to write admin log ({action}): {e}")
