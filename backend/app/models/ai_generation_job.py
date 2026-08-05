from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.lesson import Lesson
    from app.models.user import User
    from app.models.ai_generation_question import AIGenerationQuestion
    from app.models.ai_generation_chunk import AIGenerationChunk
    from app.models.ai_generation_log import AIGenerationLog


class AIGenerationJob(Base):
    __tablename__ = "ai_generation_jobs"

    job_id: Mapped[str] = mapped_column(
        String(100),
        primary_key=True,
        index=True,
    )

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="QUEUED",
        nullable=False,
        index=True,
    )

    current_stage: Mapped[str | None] = mapped_column(
        String(50),
        default="EXTRACTING",
        nullable=True,
    )

    progress_pct: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    progress_message: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    failure_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    current_chunk: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    total_chunks: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    configuration: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    total_words: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    estimated_duration_sec: Mapped[int] = mapped_column(
        Integer,
        default=30,
    )

    tokens_input: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    tokens_output: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    is_locked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    retry_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    lesson: Mapped["Lesson"] = relationship("Lesson")
    teacher: Mapped["User"] = relationship("User")
    questions: Mapped[list["AIGenerationQuestion"]] = relationship(
        "AIGenerationQuestion",
        back_populates="job",
        cascade="all, delete-orphan",
    )
    chunks: Mapped[list["AIGenerationChunk"]] = relationship(
        "AIGenerationChunk",
        back_populates="job",
        cascade="all, delete-orphan",
    )
    logs: Mapped[list["AIGenerationLog"]] = relationship(
        "AIGenerationLog",
        back_populates="job",
        cascade="all, delete-orphan",
    )
