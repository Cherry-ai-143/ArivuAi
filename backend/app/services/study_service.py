from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.study_session import StudySession
from app.models.lesson import Lesson
from app.models.chapter import Chapter
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.schemas.study_session import (
    StudySessionStartRequest,
    StudySessionResponse,
    StudySessionEndResponse,
)


class StudyService:

    def __init__(self, db: Session):
        self.db = db

    def _verify_student_enrolled_for_lesson(self, student_id: int, lesson_id: int):
        lesson_query = (
            select(Lesson, Chapter.course_id)
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .where(Lesson.id == lesson_id)
        )
        row = self.db.execute(lesson_query).first()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

        course_id = row[1]
        enrollment = self.db.execute(
            select(CourseEnrollment).where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.status != EnrollmentStatus.DROPPED,
            )
        ).scalar_one_or_none()

        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Student must be enrolled in the course to start a study session",
            )

    def start_study_session(
        self, student_id: int, req: StudySessionStartRequest, client_ip: Optional[str] = None
    ) -> StudySessionResponse:
        self._verify_student_enrolled_for_lesson(student_id, req.lesson_id)

        session = StudySession(
            student_id=student_id,
            lesson_id=req.lesson_id,
            device_type=req.device_type,
            browser=req.browser,
            ip_address=client_ip,
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return StudySessionResponse.model_validate(session)

    def end_study_session(self, student_id: int, session_id: int) -> StudySessionEndResponse:
        session = self.db.execute(
            select(StudySession).where(
                StudySession.id == session_id,
                StudySession.student_id == student_id,
            )
        ).scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")

        if session.ended_at:
            return StudySessionEndResponse(
                id=session.id,
                started_at=session.started_at,
                ended_at=session.ended_at,
                duration_seconds=session.duration_seconds,
            )

        now = datetime.utcnow()
        session.ended_at = now
        duration = int((now - session.started_at.replace(tzinfo=None)).total_seconds())
        session.duration_seconds = max(0, duration)

        self.db.commit()
        self.db.refresh(session)

        return StudySessionEndResponse(
            id=session.id,
            started_at=session.started_at,
            ended_at=session.ended_at,
            duration_seconds=session.duration_seconds,
        )
