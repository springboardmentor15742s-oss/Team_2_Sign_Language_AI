from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    decode_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.crud.user import (
    authenticate_user,
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_password,
)
from app.database.database import get_db
from app.models.user import User, PasswordResetToken
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    AccessTokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = create_user(db, user_in)
    access_token = create_access_token(str(user.id), {"role": user.role.value})
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token(str(user.id), {"role": user.role.value})
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT: logout is handled client-side by discarding tokens.
    # If a blacklist/allowlist store (e.g. Redis) is added later, revoke here.
    return MessageResponse(message="Logged out successfully")


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    decoded = decode_refresh_token(payload.refresh_token)
    if decoded is None or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = decoded.get("sub")
    user = get_user_by_id(db, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    access_token = create_access_token(str(user.id), {"role": user.role.value})
    return AccessTokenResponse(access_token=access_token)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    # Always return a generic message so we don't leak which emails are registered.
    generic_message = "If that email is registered, a reset link has been sent."
    if not user:
        return MessageResponse(message=generic_message)

    reset_token = create_password_reset_token(str(user.id))
    decoded = decode_token(reset_token, settings.SECRET_KEY)
    expires_at = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)

    db_token = PasswordResetToken(user_id=user.id, token=reset_token, expires_at=expires_at)
    db.add(db_token)
    db.commit()

    # TODO: integrate a real email provider (e.g. SES/SendGrid) via app/services/email_service.py.
    # For now the token is issued and stored; sending it out is a follow-up integration step.

    return MessageResponse(message=generic_message)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.token, settings.SECRET_KEY)
    if decoded is None or decoded.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    db_token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token == payload.token, PasswordResetToken.used == False)  # noqa: E712
        .first()
    )
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset token")

    user = get_user_by_id(db, db_token.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    update_user_password(db, user, payload.new_password)
    db_token.used = True
    db.commit()

    return MessageResponse(message="Password has been reset successfully")


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
