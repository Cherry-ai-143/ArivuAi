from datetime import datetime
from typing import TYPE_CHECKING

from app.models.chapter import Chapter

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Enum as SqlEnum,
    text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.database.base import Base
from app.enums import CourseLevel

# Type checking imports
if TYPE_CHECKING:
    from app.models.user import User
    from app.models.assessment import Assessment
    # from app.models.chapter import Chapter
    # from app.models.enrollment import Enrollment


class Course(Base):
    __tablename__ = "courses"

    # ------------------------------------------------------------------
    # Primary Key
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # ------------------------------------------------------------------
    # Teacher Foreign Key
    # ------------------------------------------------------------------
    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Course Title
    # ------------------------------------------------------------------
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Course Description
    # ------------------------------------------------------------------
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Course Thumbnail
    # ------------------------------------------------------------------
    thumbnail: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Course Level
    # ------------------------------------------------------------------
    level: Mapped[CourseLevel] = mapped_column(
        SqlEnum(
            CourseLevel,
            name="course_level_enum",
        ),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Course Language
    # ------------------------------------------------------------------
    language: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Estimated Duration (Hours)
    # ------------------------------------------------------------------
    duration_hours: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Publish Status
    # ------------------------------------------------------------------
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("false"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Created Time
    # ------------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # ------------------------------------------------------------------
    # Updated Time
    # ------------------------------------------------------------------
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------

    # Teacher
    teacher: Mapped["User"] = relationship(
        back_populates="courses",
    )

    # Assessments
    assessments: Mapped[list["Assessment"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
    )
    
    # Chapters Relationship
    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
    )

 