from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    String,
    Integer,
    ForeignKey,
    DateTime,
    Text,
    Enum as SqlEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy.sql import func
from sqlalchemy import select

from app.database.base import Base
from app.enums.assessment import (
    AssessmentStatus,
    AssessmentType,
    AssessmentScope,
)

# Type Checking Imports
if TYPE_CHECKING:
    from app.models.user import User
    from app.models.question import Question
    from app.models.course import Course
    from app.models.chapter import Chapter
    from app.models.lesson import Lesson
    from app.models.assessment_attempt import AssessmentAttempt
    from app.models.assessment_question import AssessmentQuestion


class Assessment(Base):
    __tablename__ = "assessments"

    # Primary Key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Assessment Title
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Assessment Description
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Assessment Type
    assessment_type: Mapped[AssessmentType] = mapped_column(
        SqlEnum(AssessmentType),
        nullable=False,
        default=AssessmentType.QUIZ,
    )

    # Assessment Scope
    scope: Mapped[AssessmentScope] = mapped_column(
        SqlEnum(AssessmentScope),
        nullable=False,
        default=AssessmentScope.LESSON,
    )

    # Status (replaces is_published boolean)
    status: Mapped[AssessmentStatus] = mapped_column(
        SqlEnum(AssessmentStatus),
        nullable=False,
        default=AssessmentStatus.DRAFT,
    )

    # Course Foreign Key
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id"),
        nullable=False,
        index=True,
    )

    # Chapter Foreign Key (nullable)
    chapter_id: Mapped[int | None] = mapped_column(
        ForeignKey("chapters.id"),
        nullable=True,
        index=True,
    )

    # Lesson Foreign Key (nullable)
    lesson_id: Mapped[int | None] = mapped_column(
        ForeignKey("lessons.id"),
        nullable=True,
        index=True,
    )

    # Duration (Minutes)
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=20,
    )

    # Passing Score (%)
    passing_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=60,
    )

    # Max Attempts
    max_attempts: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,
    )

    # Shuffle Questions
    shuffle_questions: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Shuffle Options
    shuffle_options: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Show Correct Answers
    show_correct_answers: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Teacher Foreign Key
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # Created Time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Updated Time
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Teacher Relationship
    teacher: Mapped["User"] = relationship(
        "User",
        back_populates="assessments",
    )

    # Course Relationship
    course: Mapped["Course"] = relationship(
        "Course",
        back_populates="assessments",
    )

    # Chapter Relationship
    chapter: Mapped["Chapter | None"] = relationship("Chapter")

    # Lesson Relationship
    lesson: Mapped["Lesson | None"] = relationship("Lesson")

    # Assessment Questions (bridge table) Relationship
    assessment_questions: Mapped[list["AssessmentQuestion"]] = relationship(
        "AssessmentQuestion",
        back_populates="assessment",
        cascade="all, delete-orphan",
        order_by="AssessmentQuestion.order_number",
    )

    # Assessment Attempts Relationship
    attempts: Mapped[list["AssessmentAttempt"]] = relationship(
        "AssessmentAttempt",
        back_populates="assessment",
    )

    @property
    def total_marks(self) -> int:
        """Compute total marks dynamically from linked bridge questions.

        Not stored in the database.
        """
        if not self.assessment_questions:
            return 0
        return sum(aq.marks for aq in self.assessment_questions)