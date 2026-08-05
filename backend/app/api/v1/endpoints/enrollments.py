from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.enrollment import CourseEnrollmentResponse, CourseEnrollmentStatusResponse
from app.services.enrollment_service import EnrollmentService

router = APIRouter()


@router.get("/me", response_model=List[CourseEnrollmentResponse], summary="Get my enrolled courses")
def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = EnrollmentService(db)
    return service.get_student_enrollments(current_user.id)


@router.post("/{course_id}", response_model=CourseEnrollmentResponse, status_code=status.HTTP_201_CREATED, summary="Enroll student in course")
def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = EnrollmentService(db)
    return service.enroll_student(current_user.id, course_id)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Drop enrolled course")
def drop_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = EnrollmentService(db)
    service.drop_course(current_user.id, course_id)


@router.get("/{course_id}", response_model=CourseEnrollmentStatusResponse, summary="Get enrollment status for a course")
def get_enrollment_status(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = EnrollmentService(db)
    return service.get_enrollment_status(current_user.id, course_id)
