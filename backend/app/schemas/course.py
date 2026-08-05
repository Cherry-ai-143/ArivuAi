from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.enums import CourseLevel


# Base Schema
class CourseBase(BaseModel):
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


# Create Course
class CourseCreate(CourseBase):
    pass


# Update Course
class CourseUpdate(BaseModel):
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


# Course Response
class CourseResponse(CourseBase):
    id: int

    teacher_id: int

    is_published: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# Course List Response
class CourseListResponse(BaseModel):
    courses: list[CourseResponse]

    total: int