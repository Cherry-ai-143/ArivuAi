from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0, nullable=False)
    device_type = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)
    browser = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("User", backref="study_sessions")
    lesson = relationship("Lesson", backref="study_sessions")

    __table_args__ = (
        Index("idx_session_student_id", "student_id"),
        Index("idx_session_lesson_id", "lesson_id"),
        Index("idx_session_started_at", "started_at"),
    )
