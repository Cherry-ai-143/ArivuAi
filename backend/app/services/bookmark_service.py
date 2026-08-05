from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.student_bookmark import StudentBookmark
from app.models.lesson import Lesson
from app.models.chapter import Chapter
from app.models.course import Course
from app.schemas.bookmark import BookmarkResponse


class BookmarkService:

    def __init__(self, db: Session):
        self.db = db

    def add_bookmark(self, student_id: int, lesson_id: int) -> BookmarkResponse:
        lesson = self.db.execute(select(Lesson).where(Lesson.id == lesson_id)).scalar_one_or_none()
        if not lesson:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

        existing = self.db.execute(
            select(StudentBookmark).where(
                StudentBookmark.student_id == student_id,
                StudentBookmark.lesson_id == lesson_id,
            )
        ).scalar_one_or_none()

        if existing:
            return self._format_bookmark(existing)

        bookmark = StudentBookmark(student_id=student_id, lesson_id=lesson_id)
        self.db.add(bookmark)
        self.db.commit()
        self.db.refresh(bookmark)
        return self._format_bookmark(bookmark)

    def get_student_bookmarks(self, student_id: int) -> List[BookmarkResponse]:
        bookmarks = self.db.execute(
            select(StudentBookmark)
            .where(StudentBookmark.student_id == student_id)
            .order_by(StudentBookmark.created_at.desc())
        ).scalars().all()

        return [self._format_bookmark(b) for b in bookmarks]

    def remove_bookmark(self, student_id: int, lesson_id: int) -> None:
        bookmark = self.db.execute(
            select(StudentBookmark).where(
                StudentBookmark.student_id == student_id,
                StudentBookmark.lesson_id == lesson_id,
            )
        ).scalar_one_or_none()

        if not bookmark:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")

        self.db.delete(bookmark)
        self.db.commit()

    def _format_bookmark(self, b: StudentBookmark) -> BookmarkResponse:
        row = self.db.execute(
            select(Lesson.title, Course.id, Course.title)
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .join(Course, Course.id == Chapter.course_id)
            .where(Lesson.id == b.lesson_id)
        ).first()

        les_title, crs_id, crs_title = (row[0], row[1], row[2]) if row else (None, None, None)
        return BookmarkResponse(
            id=b.id,
            student_id=b.student_id,
            lesson_id=b.lesson_id,
            created_at=b.created_at,
            lesson_title=les_title,
            course_id=crs_id,
            course_title=crs_title,
        )
