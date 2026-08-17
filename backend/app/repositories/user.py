from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> User | None:
        query = select(User).where(User.id == user_id)
        result = self.db.execute(query)
        return result.scalar_one_or_none()

    def get_user_by_email(self, email: str) -> User | None:
        query = select(User).where(User.email == email)
        result = self.db.execute(query)
        return result.scalar_one_or_none()

    def create_user(
        self,
        user_data: UserCreate,
        hashed_password: str
    ) -> User:

        user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def update_user(self, user: User, update_data: dict) -> User:
        for field, value in update_data.items():
            if value is not None and hasattr(user, field):
                setattr(user, field, value)

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_avatar(self, user: User, avatar_url: str) -> User:
        user.avatar_url = avatar_url
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user: User) -> None:
        from sqlalchemy import text
        from app.models.course import Course
        from app.repositories.course import CourseRepository

        user_id = user.id

        # 1. Delete AI generation jobs
        self.db.execute(
            text("DELETE FROM ai_generation_jobs WHERE teacher_id = :uid"),
            {"uid": user_id},
        )

        # 2. Delete student answers & assessment attempts
        self.db.execute(
            text(
                "DELETE FROM student_answers WHERE attempt_id IN (SELECT id FROM assessment_attempts WHERE student_id = :uid)"
            ),
            {"uid": user_id},
        )
        self.db.execute(
            text("DELETE FROM assessment_attempts WHERE student_id = :uid"),
            {"uid": user_id},
        )

        # 3. Delete student progress, bookmarks, study sessions, enrollments
        self.db.execute(
            text("DELETE FROM student_bookmarks WHERE student_id = :uid"),
            {"uid": user_id},
        )
        self.db.execute(
            text("DELETE FROM lesson_progress WHERE student_id = :uid"),
            {"uid": user_id},
        )
        self.db.execute(
            text("DELETE FROM study_sessions WHERE student_id = :uid"),
            {"uid": user_id},
        )
        self.db.execute(
            text("DELETE FROM course_enrollments WHERE student_id = :uid"),
            {"uid": user_id},
        )

        # 4. Delete notifications
        self.db.execute(
            text("DELETE FROM notifications WHERE user_id = :uid"),
            {"uid": user_id},
        )

        # 5. Delete courses owned by teacher (if any)
        course_repo = CourseRepository(self.db)
        teacher_courses = (
            self.db.query(Course).filter(Course.teacher_id == user_id).all()
        )
        for course in teacher_courses:
            course_repo.delete_course(course)

        # 6. Delete assessments created by teacher
        self.db.execute(
            text("DELETE FROM assessments WHERE created_by = :uid"),
            {"uid": user_id},
        )

        # 7. Delete uploaded_files by user
        self.db.execute(
            text(
                "DELETE FROM document_chunks WHERE uploaded_file_id IN (SELECT id FROM uploaded_files WHERE uploaded_by = :uid)"
            ),
            {"uid": user_id},
        )
        self.db.execute(
            text("DELETE FROM uploaded_files WHERE uploaded_by = :uid"),
            {"uid": user_id},
        )

        # 8. Delete user itself
        self.db.delete(user)
        self.db.commit()