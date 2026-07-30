from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import verify_password
from app.crud.user import deactivate_user, update_user_password, update_user_profile
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.user import UserOut, UserUpdate, UserPasswordUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_user_profile(db, current_user, payload)


@router.put("/password", response_model=MessageResponse)
def change_password(
    payload: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    update_user_password(db, current_user, payload.new_password)
    return MessageResponse(message="Password updated successfully")


@router.delete("/profile", response_model=MessageResponse)
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deactivate_user(db, current_user)
    return MessageResponse(message="Account deactivated successfully")
