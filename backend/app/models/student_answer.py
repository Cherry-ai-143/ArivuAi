from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base


class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    attempt_id: Mapped[int] = mapped_column(
        ForeignKey("assessment_attempts.id"),
        nullable=False,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"),
        nullable=False,
    )

    selected_option: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
    )

    is_correct: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    marks_obtained: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    answered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    attempt = relationship(
        "AssessmentAttempt",
        back_populates="student_answers",
    )

    question = relationship(
        "Question",
        back_populates="student_answers",
    )