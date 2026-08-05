from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.course_enrollment import EnrollmentStatus


class CourseEnrollmentBase(BaseModel):
    course_id: int
    status: EnrollmentStatus = EnrollmentStatus.ENROLLED


class CourseEnrollmentCreate(CourseEnrollmentBase):
    pass


class CourseEnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatus
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    course_title: Optional[str] = None
    course_thumbnail: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CourseEnrollmentStatusResponse(BaseModel):
    is_enrolled: bool
    status: Optional[EnrollmentStatus] = None
    enrolled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
