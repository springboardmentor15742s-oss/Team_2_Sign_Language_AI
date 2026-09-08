from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.services.email_service import send_password_reset_email

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


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# =========================================================
# OAUTH2 TOKEN
# =========================================================

@router.post(
    "/token",
    response_model=AccessTokenResponse,
    include_in_schema=True,
)
def oauth2_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    OAuth2 password-flow compatible token endpoint
    for Swagger and API clients.
    """

    user = authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(
        str(user.id),
        {
            "role": user.role.value,
        },
    )

    return AccessTokenResponse(
        access_token=access_token
    )


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(
        db,
        user_in.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    # Public registration is limited to learners.
    # Privileged roles are created by administrators.
    if user_in.role.value != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Public registration is restricted "
                "to learner accounts"
            ),
        )

    user = create_user(
        db,
        user_in,
    )

    access_token = create_access_token(
        str(user.id),
        {
            "role": user.role.value,
        },
    )

    refresh_token = create_refresh_token(
        str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user,
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        credentials.email,
        credentials.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(
        str(user.id),
        {
            "role": user.role.value,
        },
    )

    refresh_token = create_refresh_token(
        str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user,
    )


# =========================================================
# LOGOUT
# =========================================================

@router.post(
    "/logout",
    response_model=MessageResponse,
)
def logout(
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    JWT authentication is currently stateless.

    Client-side logout removes the stored tokens.
    """

    return MessageResponse(
        message="Logged out successfully"
    )


# =========================================================
# REFRESH TOKEN
# =========================================================

@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
)
def refresh_token(
    payload: RefreshRequest,
    db: Session = Depends(get_db),
):
    decoded = decode_refresh_token(
        payload.refresh_token
    )

    if (
        decoded is None
        or decoded.get("type") != "refresh"
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Invalid or expired refresh token"
            ),
        )

    user_id = decoded.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Invalid or expired refresh token"
            ),
        )

    user = get_user_by_id(
        db,
        int(user_id),
    )

    if (
        not user
        or not user.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Invalid or expired refresh token"
            ),
        )

    access_token = create_access_token(
        str(user.id),
        {
            "role": user.role.value,
        },
    )

    return AccessTokenResponse(
        access_token=access_token
    )


# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a password-reset token and email
    the reset link to the learner.

    A generic response is always returned so the
    endpoint does not reveal whether an email
    address exists in the database.
    """

    generic_message = (
        "If that email is registered, "
        "a reset link has been sent."
    )

    user = get_user_by_email(
        db,
        payload.email,
    )

    # Do not reveal whether the account exists.
    if not user:
        return MessageResponse(
            message=generic_message
        )

    # Create signed reset token.
    reset_token = (
        create_password_reset_token(
            str(user.id)
        )
    )

    decoded = decode_token(
        reset_token,
        settings.SECRET_KEY,
    )

    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to generate password reset token"
            ),
        )

    expires_at = datetime.fromtimestamp(
        decoded["exp"],
        tz=timezone.utc,
    )

    # Store reset token in database.
    db_token = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at,
    )

    db.add(db_token)
    db.commit()

    try:
        send_password_reset_email(
            user.email,
            reset_token,
        )

    except Exception as exc:
        # Remove the unusable token if the email failed.
        db.delete(db_token)
        db.commit()

        print(
            "Password reset email failed:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Unable to send password reset email"
            ),
        )

    return MessageResponse(
        message=generic_message
    )


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post(
    "/reset-password",
    response_model=MessageResponse,
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Validate the password-reset token,
    update the user's password,
    and mark the token as used.
    """

    decoded = decode_token(
        payload.token,
        settings.SECRET_KEY,
    )

    if (
        decoded is None
        or decoded.get("type") != "reset"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid or expired reset token"
            ),
        )

    db_token = (
        db.query(
            PasswordResetToken
        )
        .filter(
            PasswordResetToken.token
            == payload.token,
            PasswordResetToken.used
            == False,  # noqa: E712
        )
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid or already-used reset token"
            ),
        )

    # Additional DB expiry verification.
    expires_at = db_token.expires_at

    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = (
                expires_at.replace(
                    tzinfo=timezone.utc
                )
            )

        if expires_at < datetime.now(
            timezone.utc
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid or expired reset token"
                ),
            )

    user = get_user_by_id(
        db,
        db_token.user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    update_user_password(
        db,
        user,
        payload.new_password,
    )

    db_token.used = True

    db.commit()

    return MessageResponse(
        message=(
            "Password has been reset successfully"
        )
    )


# =========================================================
# CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserOut,
)
def read_current_user(
    current_user: User = Depends(
        get_current_user
    ),
):
    return current_user