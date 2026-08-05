from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, Index, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class StudentBookmark(Base):
    __tablename__ = "student_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("User", backref="bookmarks")
    lesson = relationship("Lesson", backref="bookmarked_by")

    __table_args__ = (
        UniqueConstraint("student_id", "lesson_id", name="uq_student_bookmark"),
        Index("idx_bookmark_student_id", "student_id"),
        Index("idx_bookmark_lesson_id", "lesson_id"),
    )
