import os
from uuid import uuid4
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate, ChangePasswordRequest


class UserService:

    def __init__(self, db: Session):
        self.repository = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:

        # Check if email already exists
        existing_user = self.repository.get_user_by_email(user_data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Save user
        return self.repository.create_user(
            user_data=user_data,
            hashed_password=hashed_password
        )

    def update_profile(self, current_user: User, update_data: UserUpdate) -> User:
        data = update_data.model_dump(exclude_unset=True)
        return self.repository.update_user(current_user, data)

    def change_password(self, current_user: User, password_data: ChangePasswordRequest) -> dict:
        # Verify old password
        if not verify_password(password_data.old_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect old password"
            )

        # Verify new password & confirm password match
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        # Reject same password
        if verify_password(password_data.new_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from old password"
            )

        # Validate password length
        if len(password_data.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be at least 8 characters long"
            )

        # Hash & update new password
        new_hashed = hash_password(password_data.new_password)
        self.repository.update_password(current_user, new_hashed)

        return {"message": "Password changed successfully."}

    def upload_avatar(self, current_user: User, file: UploadFile) -> dict:
        # Validate content type and file extension
        allowed_content_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        filename_lower = file.filename.lower() if file.filename else ""
        allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]

        has_valid_ext = any(filename_lower.endswith(ext) for ext in allowed_extensions)
        has_valid_type = file.content_type in allowed_content_types if file.content_type else False

        if not (has_valid_ext or has_valid_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed."
            )

        # Read file contents & validate size (Max 10 MB)
        contents = file.file.read()
        max_bytes = 10 * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum limit of 10 MB."
            )

        # Determine extension
        ext = ".png"
        for candidate_ext in allowed_extensions:
            if filename_lower.endswith(candidate_ext):
                ext = candidate_ext
                break

        # Setup uploads directory
        upload_dir = os.path.join("uploads", "avatars")
        os.makedirs(upload_dir, exist_ok=True)

        # Remove previous avatar file if exists
        if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
            old_filename = os.path.basename(current_user.avatar_url)
            old_filepath = os.path.join(upload_dir, old_filename)
            if os.path.exists(old_filepath):
                try:
                    os.remove(old_filepath)
                except Exception:
                    pass

        # Generate unique sanitized filename
        new_filename = f"user_{current_user.id}_{uuid4().hex[:8]}{ext}"
        new_filepath = os.path.join(upload_dir, new_filename)

        with open(new_filepath, "wb") as f:
            f.write(contents)

        avatar_url = f"/uploads/avatars/{new_filename}"
        self.repository.update_avatar(current_user, avatar_url)

        return {"avatar_url": avatar_url}