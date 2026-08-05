from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, UniqueConstraint, Index, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class EnrollmentStatus(str, PyEnum):
    ENROLLED = "ENROLLED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DROPPED = "DROPPED"


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.ENROLLED, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    student = relationship("User", backref="course_enrollments")
    course = relationship("Course", backref="enrollments")

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_student_course_enrollment"),
        Index("idx_enrollment_student_id", "student_id"),
        Index("idx_enrollment_course_id", "course_id"),
        Index("idx_enrollment_status", "status"),
    )
