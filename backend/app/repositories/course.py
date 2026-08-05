from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate


class CourseRepository:

    def __init__(self, db: Session):
        self.db = db

    # Create Course
    def create_course(
        self,
        teacher_id: int,
        course_data: CourseCreate,
    ) -> Course:

        course = Course(
            teacher_id=teacher_id,
            **course_data.model_dump(),
        )

        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)

        return course

    # Get Course By ID
    def get_course_by_id(
        self,
        course_id: int,
    ) -> Course | None:

        query = select(Course).where(
            Course.id == course_id
        )

        result = self.db.execute(query)

        return result.scalar_one_or_none()

    # Get Course By Title
    def get_course_by_title(
        self,
        teacher_id: int,
        title: str,
    ) -> Course | None:

        query = select(Course).where(
            Course.teacher_id == teacher_id,
            Course.title == title,
        )

        result = self.db.execute(query)

        return result.scalar_one_or_none()

    # Get All Courses
    def get_all_courses(self) -> list[Course]:

        query = select(Course)

        result = self.db.execute(query)

        return result.scalars().all()

    # Update Course
    def update_course(
        self,
        course: Course,
        course_data: CourseUpdate,
    ) -> Course:

        update_data = course_data.model_dump(
            exclude_unset=True,
        )

        for key, value in update_data.items():
            setattr(course, key, value)

        self.db.commit()
        self.db.refresh(course)

        return course

    # Delete Course
    def delete_course(
        self,
        course: Course,
    ) -> None:
        from sqlalchemy import text

        course_id = course.id

        try:
            # 1. Delete document_chunks
            self.db.execute(
                text("""
                DELETE FROM document_chunks 
                WHERE uploaded_file_id IN (
                    SELECT uf.id FROM uploaded_files uf
                    JOIN lessons l ON uf.lesson_id = l.id
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 2. Delete uploaded_files
            self.db.execute(
                text("""
                DELETE FROM uploaded_files 
                WHERE lesson_id IN (
                    SELECT l.id FROM lessons l
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 3. Delete lesson_resources
            self.db.execute(
                text("""
                DELETE FROM lesson_resources 
                WHERE lesson_id IN (
                    SELECT l.id FROM lessons l
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 4. Delete contents
            self.db.execute(
                text("""
                DELETE FROM contents 
                WHERE lesson_id IN (
                    SELECT l.id FROM lessons l
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 5. Delete student_bookmarks
            self.db.execute(
                text("""
                DELETE FROM student_bookmarks 
                WHERE lesson_id IN (
                    SELECT l.id FROM lessons l
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 6. Delete lesson_progress
            self.db.execute(
                text("""
                DELETE FROM lesson_progress 
                WHERE lesson_id IN (
                    SELECT l.id FROM lessons l
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 7. Delete study_sessions
            self.db.execute(
                text("""
                DELETE FROM study_sessions 
                WHERE lesson_id IN (
                    SELECT l.id FROM lessons l
                    JOIN chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 8. Delete lessons
            self.db.execute(
                text("""
                DELETE FROM lessons 
                WHERE chapter_id IN (
                    SELECT id FROM chapters WHERE course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            # 9. Delete chapters
            self.db.execute(text("DELETE FROM chapters WHERE course_id = :cid"), {"cid": course_id})

            # 10. Delete student_answers, questions, attempts, assessments
            self.db.execute(
                text("""
                DELETE FROM student_answers 
                WHERE question_id IN (
                    SELECT q.id FROM questions q
                    JOIN assessments a ON q.assessment_id = a.id
                    WHERE a.course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            self.db.execute(
                text("""
                DELETE FROM questions 
                WHERE assessment_id IN (
                    SELECT id FROM assessments WHERE course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            self.db.execute(
                text("""
                DELETE FROM assessment_attempts 
                WHERE assessment_id IN (
                    SELECT id FROM assessments WHERE course_id = :cid
                )
                """),
                {"cid": course_id}
            )

            self.db.execute(text("DELETE FROM assessments WHERE course_id = :cid"), {"cid": course_id})

            # 11. Delete course enrollments
            self.db.execute(text("DELETE FROM course_enrollments WHERE course_id = :cid"), {"cid": course_id})

            # 12. Delete course
            self.db.execute(text("DELETE FROM courses WHERE id = :cid"), {"cid": course_id})

            self.db.commit()
        except Exception as err:
            self.db.rollback()
            print(f"Error during raw SQL course deletion: {err}")
            raise err