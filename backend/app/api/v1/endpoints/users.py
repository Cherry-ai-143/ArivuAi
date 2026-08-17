from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
    ChangePasswordResponse,
    AvatarResponse,
)
from app.services.user import UserService
from app.core.role_checker import RoleChecker

router = APIRouter()


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    service = UserService(db)
    return service.register_user(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
def get_current_logged_user(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update current authenticated user profile",
)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    return service.update_profile(current_user, user_update)


@router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Delete current authenticated user account and all associated data",
)
def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    return service.delete_account(current_user)


@router.post(
    "/change-password",
    response_model=ChangePasswordResponse,
    summary="Change current authenticated user password",
)
def change_user_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    return service.change_password(current_user, password_data)


@router.post(
    "/avatar",
    response_model=AvatarResponse,
    summary="Upload user avatar image",
)
def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    return service.upload_avatar(current_user, file)


@router.get("/admin", summary="Admin dashboard endpoint")
def admin_dashboard(
    current_user=Depends(RoleChecker(["admin"]))
):
    return {
        "message": "Welcome Admin!",
        "user": current_user.email
    }


@router.get("/teacher", summary="Teacher dashboard endpoint")
def teacher_dashboard(
    current_user=Depends(RoleChecker(["teacher"]))
):
    return {
        "message": "Welcome Teacher!",
        "user": current_user.email
    }


@router.get("/student", summary="Student dashboard endpoint")
def student_dashboard(
    current_user=Depends(RoleChecker(["student"]))
):
    return {
        "message": "Welcome Student!",
        "user": current_user.email
    }