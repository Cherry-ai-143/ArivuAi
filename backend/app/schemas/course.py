# purpose : Define Pydantic schemas used for creating, updating, and returning courses.

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.enums import CourseLevel


class CourseBase(BaseModel):
    # purpose : Define common course fields and validation rules.

    title: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )

    description: str = Field(
        ...,
        min_length=10,
    )

    thumbnail: Optional[str] = None

    level: CourseLevel

    language: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    duration_hours: int = Field(
        ...,
        gt=0,
    )

    is_published: bool = Field(default=False)

    target_education_level: Optional[str] = None
    target_course: Optional[str] = None
    target_branch: Optional[str] = None
    target_year_semester: Optional[str] = None


class CourseCreate(CourseBase):
    # purpose : Validate data required when creating a course.
    pass


class CourseUpdate(BaseModel):
    # purpose : Validate optional fields used when updating an existing course.

    title: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=255,
    )

    description: Optional[str] = Field(
        default=None,
        min_length=10,
    )

    thumbnail: Optional[str] = None

    level: Optional[CourseLevel] = None

    language: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    duration_hours: Optional[int] = Field(
        default=None,
        gt=0,
    )

    is_published: Optional[bool] = None

    target_education_level: Optional[str] = None
    target_course: Optional[str] = None
    target_branch: Optional[str] = None
    target_year_semester: Optional[str] = None


class CourseResponse(CourseBase):
    # purpose : Define the course structure returned by the API.

    id: int

    teacher_id: int

    is_published: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class CourseListResponse(BaseModel):
    # purpose : Define a non-paginated course list response.

    courses: list[CourseResponse]

    total: int