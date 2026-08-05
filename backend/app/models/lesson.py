from datetime import datetime
from typing import TYPE_CHECKING
from app.models.content import Content
from app.models.uploaded_file import UploadedFile

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


# Type Checking Imports
if TYPE_CHECKING:
    from app.models.chapter import Chapter
    from app.models.content import Content


class Lesson(Base):
    __tablename__ = "lessons"

    # Primary Key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Chapter Foreign Key
    chapter_id: Mapped[int] = mapped_column(
        ForeignKey("chapters.id"),
        nullable=False,
    )

    # Lesson Title
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Lesson Description
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Lesson Order Number
    order_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Publish Status
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )

    # Created At
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Updated At
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Chapter Relationship
    chapter: Mapped["Chapter"] = relationship(
        "Chapter",
        back_populates="lessons",
    )

    # Contents Relationship
    contents: Mapped[list["Content"]] = relationship(
        "Content",
        back_populates="lesson",
        cascade="all, delete-orphan",
    )
    
    # Uploaded Files Relationship
    uploaded_files: Mapped[list["UploadedFile"]] = relationship(
        "UploadedFile",
        back_populates="lesson",
        cascade="all, delete-orphan",
    )