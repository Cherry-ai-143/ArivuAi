from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.models.lesson_progress import LessonProgress
from app.models.lesson import Lesson
from app.models.chapter import Chapter
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.schemas.progress import (
    LessonProgressResponse,
    LessonProgressUpdate,
    CourseProgressResponse,
    ContinueLearningResponse,
)


class ProgressService:

    def __init__(self, db: Session):
        self.db = db

    def _verify_student_enrolled_for_lesson(self, student_id: int, lesson_id: int) -> tuple[Lesson, CourseEnrollment]:
        lesson_query = (
            select(Lesson, Chapter.course_id)
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .where(Lesson.id == lesson_id)
        )
        row = self.db.execute(lesson_query).first()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

        lesson, course_id = row[0], row[1]

        enrollment = self.db.execute(
            select(CourseEnrollment).where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.status != EnrollmentStatus.DROPPED,
            )
        ).scalar_one_or_none()

        if not enrollment:
            enrollment = CourseEnrollment(
                student_id=student_id,
                course_id=course_id,
                status=EnrollmentStatus.ENROLLED,
            )
            self.db.add(enrollment)
            self.db.commit()
            self.db.refresh(enrollment)

        return lesson, enrollment

    def get_lesson_progress(self, student_id: int, lesson_id: int) -> LessonProgressResponse:
        self._verify_student_enrolled_for_lesson(student_id, lesson_id)

        progress = self.db.execute(
            select(LessonProgress).where(
                LessonProgress.student_id == student_id,
                LessonProgress.lesson_id == lesson_id,
            )
        ).scalar_one_or_none()

        if not progress:
            progress = LessonProgress(
                student_id=student_id,
                lesson_id=lesson_id,
                progress_percentage=0,
                completed=False,
            )
            self.db.add(progress)
            self.db.commit()
            self.db.refresh(progress)

        return LessonProgressResponse.model_validate(progress)

    def update_lesson_progress(
        self, student_id: int, lesson_id: int, update_data: LessonProgressUpdate
    ) -> LessonProgressResponse:
        lesson, enrollment = self._verify_student_enrolled_for_lesson(student_id, lesson_id)

        progress = self.db.execute(
            select(LessonProgress).where(
                LessonProgress.student_id == student_id,
                LessonProgress.lesson_id == lesson_id,
            )
        ).scalar_one_or_none()

        clamped_pct = max(0, min(100, update_data.progress_percentage))
        now = datetime.utcnow()

        if not progress:
            progress = LessonProgress(
                student_id=student_id,
                lesson_id=lesson_id,
                progress_percentage=clamped_pct,
                time_spent_seconds=update_data.time_spent_seconds or 0,
                completed=clamped_pct == 100,
                started_at=now,
                last_accessed=now,
                completed_at=now if clamped_pct == 100 else None,
            )
            self.db.add(progress)
        else:
            progress.progress_percentage = clamped_pct
            if update_data.time_spent_seconds:
                progress.time_spent_seconds += update_data.time_spent_seconds
            progress.last_accessed = now
            if clamped_pct == 100 and not progress.completed:
                progress.completed = True
                progress.completed_at = now

        # Update enrollment status to IN_PROGRESS if ENROLLED
        if enrollment.status == EnrollmentStatus.ENROLLED:
            enrollment.status = EnrollmentStatus.IN_PROGRESS

        self.db.commit()
        self.db.refresh(progress)
        return LessonProgressResponse.model_validate(progress)

    def get_course_progress(self, student_id: int, course_id: int) -> CourseProgressResponse:
        total_lessons = self.db.execute(
            select(func.count(Lesson.id))
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .where(Chapter.course_id == course_id)
        ).scalar() or 0

        if total_lessons == 0:
            return CourseProgressResponse(
                course_id=course_id, progress=0, completed_lessons=0, total_lessons=0
            )

        completed_lessons = self.db.execute(
            select(func.count(LessonProgress.id))
            .join(Lesson, Lesson.id == LessonProgress.lesson_id)
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .where(
                LessonProgress.student_id == student_id,
                Chapter.course_id == course_id,
                LessonProgress.completed == True,
            )
        ).scalar() or 0

        pct = round((completed_lessons / total_lessons) * 100)
        return CourseProgressResponse(
            course_id=course_id,
            progress=pct,
            completed_lessons=completed_lessons,
            total_lessons=total_lessons,
        )

    def get_continue_learning(self, student_id: int) -> Optional[ContinueLearningResponse]:
        # Priority 1: Enrolled lesson with highest last_accessed DESC
        p1_query = (
            select(LessonProgress, Lesson, Chapter, Course)
            .join(Lesson, Lesson.id == LessonProgress.lesson_id)
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .join(Course, Course.id == Chapter.course_id)
            .join(CourseEnrollment, CourseEnrollment.course_id == Course.id)
            .where(
                LessonProgress.student_id == student_id,
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.status != EnrollmentStatus.DROPPED,
            )
            .order_by(desc(LessonProgress.last_accessed))
            .limit(1)
        )
        row = self.db.execute(p1_query).first()
        if row:
            prog, les, chap, crs = row[0], row[1], row[2], row[3]
            return ContinueLearningResponse(
                course_id=crs.id,
                course_title=crs.title,
                chapter_id=chap.id,
                chapter_title=chap.title,
                lesson_id=les.id,
                lesson_title=les.title,
                progress=prog.progress_percentage,
                thumbnail=crs.thumbnail,
                resume_url=f"/dashboard/courses/{crs.id}/learn?lesson={les.id}",
            )

        # Priority 2 & 3: Latest enrolled course -> first incomplete lesson or first lesson
        enrolled_course = self.db.execute(
            select(Course)
            .join(CourseEnrollment, CourseEnrollment.course_id == Course.id)
            .where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.status != EnrollmentStatus.DROPPED,
            )
            .order_by(desc(CourseEnrollment.enrolled_at))
            .limit(1)
        ).scalar_one_or_none()

        if not enrolled_course:
            return None

        first_lesson_row = self.db.execute(
            select(Lesson, Chapter)
            .join(Chapter, Chapter.id == Lesson.chapter_id)
            .where(Chapter.course_id == enrolled_course.id)
            .order_by(Chapter.order_number.asc(), Lesson.order_number.asc())
            .limit(1)
        ).first()

        if not first_lesson_row:
            return None

        les, chap = first_lesson_row[0], first_lesson_row[1]
        return ContinueLearningResponse(
            course_id=enrolled_course.id,
            course_title=enrolled_course.title,
            chapter_id=chap.id,
            chapter_title=chap.title,
            lesson_id=les.id,
            lesson_title=les.title,
            progress=0,
            thumbnail=enrolled_course.thumbnail,
            resume_url=f"/dashboard/courses/{enrolled_course.id}/learn?lesson={les.id}",
        )
