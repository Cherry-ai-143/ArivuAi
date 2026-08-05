from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.course import Course
from app.schemas.enrollment import CourseEnrollmentResponse, CourseEnrollmentStatusResponse


class EnrollmentService:

    def __init__(self, db: Session):
        self.db = db

    def enroll_student(self, student_id: int, course_id: int) -> CourseEnrollmentResponse:
        # Check if course exists
        course = self.db.execute(select(Course).where(Course.id == course_id)).scalar_one_or_none()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        # Check duplicate
        existing = self.db.execute(
            select(CourseEnrollment).where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.course_id == course_id,
            )
        ).scalar_one_or_none()

        if existing:
            if existing.status == EnrollmentStatus.DROPPED:
                existing.status = EnrollmentStatus.ENROLLED
                existing.enrolled_at = datetime.utcnow()
                self.db.commit()
                self.db.refresh(existing)
                return CourseEnrollmentResponse(
                    id=existing.id,
                    student_id=existing.student_id,
                    course_id=existing.course_id,
                    status=existing.status,
                    enrolled_at=existing.enrolled_at,
                    completed_at=existing.completed_at,
                    course_title=course.title,
                    course_thumbnail=course.thumbnail,
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student is already enrolled in this course",
            )

        enrollment = CourseEnrollment(
            student_id=student_id,
            course_id=course_id,
            status=EnrollmentStatus.ENROLLED,
        )
        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)

        return CourseEnrollmentResponse(
            id=enrollment.id,
            student_id=enrollment.student_id,
            course_id=enrollment.course_id,
            status=enrollment.status,
            enrolled_at=enrollment.enrolled_at,
            completed_at=enrollment.completed_at,
            course_title=course.title,
            course_thumbnail=course.thumbnail,
        )

    def get_student_enrollments(self, student_id: int) -> List[CourseEnrollmentResponse]:
        query = (
            select(CourseEnrollment, Course.title, Course.thumbnail)
            .join(Course, Course.id == CourseEnrollment.course_id)
            .where(CourseEnrollment.student_id == student_id)
            .order_by(CourseEnrollment.enrolled_at.desc())
        )
        results = self.db.execute(query).all()

        return [
            CourseEnrollmentResponse(
                id=en.id,
                student_id=en.student_id,
                course_id=en.course_id,
                status=en.status,
                enrolled_at=en.enrolled_at,
                completed_at=en.completed_at,
                course_title=title,
                course_thumbnail=thumb,
            )
            for en, title, thumb in results
        ]

    def get_enrollment_status(self, student_id: int, course_id: int) -> CourseEnrollmentStatusResponse:
        enrollment = self.db.execute(
            select(CourseEnrollment).where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.course_id == course_id,
            )
        ).scalar_one_or_none()

        if not enrollment or enrollment.status == EnrollmentStatus.DROPPED:
            return CourseEnrollmentStatusResponse(is_enrolled=False)

        return CourseEnrollmentStatusResponse(
            is_enrolled=True,
            status=enrollment.status,
            enrolled_at=enrollment.enrolled_at,
            completed_at=enrollment.completed_at,
        )

    def drop_course(self, student_id: int, course_id: int) -> None:
        enrollment = self.db.execute(
            select(CourseEnrollment).where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.course_id == course_id,
            )
        ).scalar_one_or_none()

        if not enrollment or enrollment.status == EnrollmentStatus.DROPPED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Active enrollment not found for this course",
            )

        enrollment.status = EnrollmentStatus.DROPPED
        self.db.commit()
