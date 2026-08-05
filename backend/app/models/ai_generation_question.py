from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.ai_generation_job import AIGenerationJob


class AIGenerationQuestion(Base):
    __tablename__ = "ai_generation_questions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    job_id: Mapped[str] = mapped_column(
        ForeignKey("ai_generation_jobs.job_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    option_a: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    option_b: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    option_c: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    option_d: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    correct_option: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    correct_answer: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    question_type: Mapped[str] = mapped_column(
        String(50),
        default="Multiple Choice",
    )

    difficulty: Mapped[str] = mapped_column(
        String(50),
        default="Medium",
    )

    bloom_level: Mapped[str] = mapped_column(
        String(50),
        default="Understanding",
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    source_attribution: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ai_confidence: Mapped[int] = mapped_column(
        Integer,
        default=90,
    )

    approved: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    edited: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    rejected_reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    job: Mapped["AIGenerationJob"] = relationship(
        "AIGenerationJob",
        back_populates="questions",
    )
