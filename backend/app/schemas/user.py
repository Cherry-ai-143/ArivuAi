from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.enums import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    is_active: bool = True
    avatar_url: str | None = None
    bio: str | None = None
    institution_name: str | None = None
    institution_type: str | None = None
    education_level: str | None = None
    course: str | None = None
    branch: str | None = None
    semester: str | None = None
    designation: str | None = None
    department: str | None = None
    qualification: str | None = None
    years_of_experience: str | None = None
    interests: list[str] | None = []
    goals: list[str] | None = []
    onboarding_completed: bool = False
    preferred_language: str | None = None
    timezone: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class UserUpdate(BaseModel):
    full_name: str | None = None
    bio: str | None = Field(default=None, max_length=1000)
    institution_name: str | None = None
    institution_type: str | None = None
    education_level: str | None = None
    course: str | None = None
    branch: str | None = None
    semester: str | None = None
    designation: str | None = None
    department: str | None = None
    qualification: str | None = None
    years_of_experience: str | None = None
    interests: list[str] | None = None
    goals: list[str] | None = None
    onboarding_completed: bool | None = None
    preferred_language: str | None = None
    timezone: str | None = None

    @field_validator("institution_name")
    @classmethod
    def validate_institution_name(cls, v: str | None) -> str | None:
        if v is not None and v.strip() != "":
            if len(v.strip()) < 2:
                raise ValueError("Institution name must be at least 2 characters")
            if len(v.strip()) > 255:
                raise ValueError("Institution name must not exceed 255 characters")
        return v


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


class ChangePasswordResponse(BaseModel):
    message: str = "Password changed successfully."


class AvatarResponse(BaseModel):
    avatar_url: str