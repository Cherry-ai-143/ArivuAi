from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.enums import UserRole
from app.repositories.lesson import LessonRepository

from app.schemas.lesson import (
    LessonCreate,
    LessonUpdate,
)


class LessonService:

    def __init__(self, db: Session):
        self.repository = LessonRepository(db)

    # Create Lesson
    def create_lesson(
        self,
        lesson_data: LessonCreate,
        current_user: User,
    ):
        if current_user.role != UserRole.TEACHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can create lessons.",
            )

        return self.repository.create(lesson_data)

    # Get All Lessons
    def get_all_lessons(self):
        return self.repository.get_all()

    # Get Lesson By ID
    def get_lesson_by_id(
        self,
        lesson_id: int,
    ):
        lesson = self.repository.get_by_id(lesson_id)

        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found.",
            )

        return lesson

    # Update Lesson
    def update_lesson(
        self,
        lesson_id: int,
        lesson_data: LessonUpdate,
        current_user: User,
    ):
        if current_user.role != UserRole.TEACHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can update lessons.",
            )

        lesson = self.repository.get_by_id(lesson_id)

        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found.",
            )

        return self.repository.update(
            lesson,
            lesson_data,
        )

    # Delete Lesson
    def delete_lesson(
        self,
        lesson_id: int,
        current_user: User,
    ):
        if current_user.role != UserRole.TEACHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can delete lessons.",
            )

        lesson = self.repository.get_by_id(lesson_id)

        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found.",
            )

        self.repository.delete(lesson)

        return {
            "message": "Lesson deleted successfully."
        }