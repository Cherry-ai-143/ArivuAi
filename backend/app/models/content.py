from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    String,
    Integer,
    Boolean,
    ForeignKey,
    DateTime,
    Enum as SqlEnum,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.database.base import Base
from app.enums import ContentType

# Type Checking Imports
if TYPE_CHECKING:
    from app.models.lesson import Lesson


class Content(Base):
    __tablename__ = "contents"

    # Primary Key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Lesson Foreign Key
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"),
        nullable=False,
    )

    # Content Title
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Content Type
    content_type: Mapped[ContentType] = mapped_column(
        SqlEnum(
            ContentType,
            name="content_type_enum",
        ),
        nullable=False,
    )

    # File URL
    file_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # Duration (Video)
    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # Display Order
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

    # Lesson Relationship
    lesson: Mapped["Lesson"] = relationship(
        back_populates="contents",
    )