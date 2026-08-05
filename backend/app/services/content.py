from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.lesson import LessonRepository
from app.repositories.content import ContentRepository
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
)


class ContentService:

    def __init__(self, db: Session):
        self.content_repository = ContentRepository(db)
        self.lesson_repository = LessonRepository(db)

    # Create Content
    def create_content(
        self,
        content_data: ContentCreate,
        current_user: User,
    ):

        lesson = self.lesson_repository.get_by_id(
            content_data.lesson_id
        )

        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

        if lesson.chapter.course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        return self.content_repository.create(
            content_data,
        )

    # Get All Contents
    def get_all_contents(self):

        return self.content_repository.get_all()

    # Get Content By ID
    def get_content_by_id(
        self,
        content_id: int,
    ):

        content = self.content_repository.get_by_id(
            content_id,
        )

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        return content

    # Update Content
    def update_content(
        self,
        content_id: int,
        content_data: ContentUpdate,
        current_user: User,
    ):

        content = self.content_repository.get_by_id(
            content_id,
        )

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        if (
            content.lesson.chapter.course.teacher_id
            != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        return self.content_repository.update(
            content,
            content_data,
        )

    # Delete Content
    def delete_content(
        self,
        content_id: int,
        current_user: User,
    ):

        content = self.content_repository.get_by_id(
            content_id,
        )

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        if (
            content.lesson.chapter.course.teacher_id
            != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        self.content_repository.delete(
            content,
        )

        return {
            "message": "Content deleted successfully",
        }