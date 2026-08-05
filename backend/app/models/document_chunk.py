from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.database.base import Base


# Type Checking Imports
if TYPE_CHECKING:
    from app.models.uploaded_file import UploadedFile


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    # Primary Key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Uploaded File Foreign Key
    uploaded_file_id: Mapped[int] = mapped_column(
        ForeignKey("uploaded_files.id"),
        nullable=False,
    )

    # Chunk Number
    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Chunk Text
    chunk_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Created Time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Uploaded File Relationship
    uploaded_file: Mapped["UploadedFile"] = relationship(
        "UploadedFile",
        back_populates="chunks",
    )