from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
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


class AIGenerationChunk(Base):
    __tablename__ = "ai_generation_chunks"

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

    chunk_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False,
    )

    attempt: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    source_range: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    token_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    questions_requested: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    questions_generated: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    duplicates_removed: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    confidence_avg: Mapped[int] = mapped_column(
        Integer,
        default=90,
    )

    raw_response: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    job: Mapped["AIGenerationJob"] = relationship(
        "AIGenerationJob",
        back_populates="chunks",
    )
