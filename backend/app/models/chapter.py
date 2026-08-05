from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean
from app.models.lesson import Lesson

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
    from app.models.course import Course


class Chapter(Base):
    __tablename__ = "chapters"

    # Primary Key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Course Foreign Key
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id"),
        nullable=False,
    )

    # Chapter Title
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Chapter Description
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Chapter Order
    order_number: Mapped[int] = mapped_column(
        Integer,
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

    # Course Relationship
    course: Mapped["Course"] = relationship(
        back_populates="chapters",
    )
    
    # Publish Status
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )
    
    # Lessons Relationship
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
    )