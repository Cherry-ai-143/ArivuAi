from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Enum as SqlEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base


# ==========================================================
# Question Type Enum
# ==========================================================

class QuestionType(str, Enum):
    """
    Question types used by the application.

    IMPORTANT:
    The Python name can be MULTIPLE_CHOICE,
    but PostgreSQL stores the value MCQ.
    """

    MULTIPLE_CHOICE = "MCQ"
    TRUE_FALSE = "TRUE_FALSE"
    FILL_BLANK = "FILL_BLANK"
    SHORT_ANSWER = "SHORT_ANSWER"
    MATCHING = "MATCHING"
    ORDERING = "ORDERING"
    MIXED = "MIXED"


# ==========================================================
# Question Model
# ==========================================================

class Question(Base):
    __tablename__ = "questions"

    # ======================================================
    # Primary Key
    # ======================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # ======================================================
    # Lesson Foreign Key
    # ======================================================

    lesson_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "lessons.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    # ======================================================
    # Difficulty
    # ======================================================

    difficulty: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # ======================================================
    # Bloom's Taxonomy Level
    # ======================================================

    bloom_level: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # ======================================================
    # Explanation
    # ======================================================

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ======================================================
    # Question Text
    # ======================================================

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # ======================================================
    # Question Type
    # ======================================================
    #
    # Python:
    #     QuestionType.MULTIPLE_CHOICE
    #
    # Database:
    #     MCQ
    #
    # ======================================================

    question_type: Mapped[QuestionType] = mapped_column(
        SqlEnum(
            QuestionType,
            name="questiontype",
            values_callable=lambda enum_cls: [
                member.value for member in enum_cls
            ],
        ),
        default=QuestionType.MULTIPLE_CHOICE,
        nullable=False,
    )

    # ======================================================
    # Options
    # ======================================================

    option_a: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    option_b: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    option_c: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    option_d: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # ======================================================
    # Correct Option
    # ======================================================

    correct_option: Mapped[str | None] = mapped_column(
        String(1),
        nullable=True,
    )

    # ======================================================
    # Correct Answer
    # ======================================================

    correct_answer: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ======================================================
    # Default Marks
    # ======================================================

    marks: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # ======================================================
    # Order Number
    # ======================================================

    order_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # ======================================================
    # Created At
    # ======================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # ======================================================
    # Updated At
    # ======================================================

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ======================================================
    # AI Metadata
    # ======================================================

    is_ai_generated: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    ai_version: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    prompt_template_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    source_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    source_attribution: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ai_confidence: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    tokens_input: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    tokens_output: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    estimated_cost: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # ======================================================
    # Usage Count
    # ======================================================

    usage_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    # ======================================================
    # Relationships
    # ======================================================

    # ------------------------------------------------------
    # Lesson
    # ------------------------------------------------------

    lesson = relationship(
        "Lesson",
        foreign_keys=[lesson_id],
    )

    # ------------------------------------------------------
    # Assessment Questions
    # ------------------------------------------------------

    assessment_questions = relationship(
        "AssessmentQuestion",
        back_populates="question",
        cascade="all, delete-orphan",
    )

    # ------------------------------------------------------
    # Student Answers
    # ------------------------------------------------------

    student_answers = relationship(
        "StudentAnswer",
        back_populates="question",
        cascade="all, delete-orphan",
    )