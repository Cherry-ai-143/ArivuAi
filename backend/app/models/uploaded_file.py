from datetime import datetime
from typing import TYPE_CHECKING, Optional
from app.models.document_chunk import DocumentChunk

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
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
    from app.models.course import Course
    from app.models.lesson import Lesson
    from app.models.user import User


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    # Primary Key
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Lesson Relationship
    lesson_id: Mapped[int | None] = mapped_column(
        ForeignKey("lessons.id"),
        nullable=True,
    )

    # Course Relationship
    course_id: Mapped[int | None] = mapped_column(
        ForeignKey("courses.id"),
        nullable=True,
    )

    # Display Title
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Original Filename
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Stored Filename
    stored_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # File URL / Path
    file_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # File Size (Bytes)
    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # MIME Type
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # Uploaded By
    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # Created Time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Lesson Relationship
    lesson: Mapped[Optional["Lesson"]] = relationship(
        "Lesson",
        back_populates="uploaded_files",
    )

    # Course Relationship
    course: Mapped[Optional["Course"]] = relationship(
        "Course",
        back_populates="uploaded_files",
    )

    # Teacher Relationship
    uploader: Mapped["User"] = relationship(
        "User",
        back_populates="uploaded_files",
    )
    
    # Document Chunks Relationship
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="uploaded_file",
        cascade="all, delete-orphan",
    )