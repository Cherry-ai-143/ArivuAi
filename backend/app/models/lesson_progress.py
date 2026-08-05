from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime, UniqueConstraint, Index, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    progress_percentage = Column(Integer, default=0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    student = relationship("User", backref="lesson_progress")
    lesson = relationship("Lesson", backref="progress_records")

    __table_args__ = (
        UniqueConstraint("student_id", "lesson_id", name="uq_student_lesson_progress"),
        Index("idx_progress_student_id", "student_id"),
        Index("idx_progress_lesson_id", "lesson_id"),
        Index("idx_progress_completed", "completed"),
        Index("idx_progress_last_accessed", "last_accessed"),
    )
