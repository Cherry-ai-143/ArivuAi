from datetime import datetime
from typing import TYPE_CHECKING, Optional, Any


from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SqlEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.enums.assignment import (
    AssignmentDifficulty,
    AssignmentStatus,
    AssignmentType,
    SubmissionStatus,
)

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.lesson import Lesson
    from app.models.user import User


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True
    )
    teacher_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    instructions: Mapped[str] = mapped_column(Text, nullable=False)

    assignment_type: Mapped[AssignmentType] = mapped_column(
        SqlEnum(AssignmentType, name="assignment_type_enum"),
        nullable=False,
        default=AssignmentType.WRITTEN,
    )
    difficulty: Mapped[AssignmentDifficulty] = mapped_column(
        SqlEnum(AssignmentDifficulty, name="assignment_difficulty_enum"),
        nullable=False,
        default=AssignmentDifficulty.MEDIUM,
    )
    max_points: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    status: Mapped[AssignmentStatus] = mapped_column(
        SqlEnum(AssignmentStatus, name="assignment_status_enum"),
        nullable=False,
        default=AssignmentStatus.DRAFT,
        index=True,
    )

    submission_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    grading_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    type_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course", backref="assignments")
    lesson: Mapped[Optional["Lesson"]] = relationship("Lesson", backref="assignments")
    teacher: Mapped["User"] = relationship("User", foreign_keys=[teacher_id], backref="created_assignments")

    rubric_criteria: Mapped[list["AssignmentRubric"]] = relationship(
        "AssignmentRubric", back_populates="assignment", cascade="all, delete-orphan", order_by="AssignmentRubric.order_index"
    )
    submissions: Mapped[list["AssignmentSubmission"]] = relationship(
        "AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan"
    )


class AssignmentRubric(Base):
    __tablename__ = "assignment_rubrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    assignment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criterion_name: Mapped[str] = mapped_column(String(255), nullable=False)
    max_points: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="rubric_criteria")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    assignment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    status: Mapped[SubmissionStatus] = mapped_column(
        SqlEnum(SubmissionStatus, name="submission_status_enum"),
        nullable=False,
        default=SubmissionStatus.DRAFT,
        index=True,
    )

    text_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    external_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_ids: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # array/dict of files info

    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    is_late: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rubric_scores: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    graded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    graded_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resubmission_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="submissions")
    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], backref="assignment_submissions")
    grader: Mapped[Optional["User"]] = relationship("User", foreign_keys=[graded_by])

    __table_args__ = (
        Index("idx_submission_assignment_student", "assignment_id", "student_id"),
    )
