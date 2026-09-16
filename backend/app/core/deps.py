from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.crud.user import get_user_by_id
from app.database.database import get_db
from app.models.user import User, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise credentials_exception

    user = get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def require_roles(*allowed_roles: RoleEnum) -> Callable:
    """Server-side RBAC dependency. Never rely on frontend route visibility for authorization."""
    allowed = set(allowed_roles)

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return role_checker


require_learner = require_roles(RoleEnum.student)
require_instructor = require_roles(RoleEnum.instructor)
require_accessibility_trainer = require_roles(RoleEnum.accessibility_trainer)
require_admin = require_roles(RoleEnum.admin)
require_instructor_or_trainer_or_admin = require_roles(
    RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin
)
require_instructor_or_admin = require_roles(RoleEnum.instructor, RoleEnum.admin)
require_staff = require_roles(
    RoleEnum.instructor, RoleEnum.accessibility_trainer, RoleEnum.admin
)
require_any_authenticated = get_current_user


def ensure_owner_or_roles(
    owner_id: int,
    current_user: User,
    *roles: RoleEnum,
) -> None:
    """Allow a user to access their own resource, or privileged staff roles."""
    if current_user.id != owner_id and current_user.role not in set(roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
