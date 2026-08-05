from sqlalchemy.orm import Session

from app.models.chapter import Chapter
from app.models.user import User
from app.repositories.chapter import ChapterRepository
from app.repositories.course import CourseRepository
from app.schemas.chapter import (
    ChapterCreate,
    ChapterUpdate,
)


class ChapterService:
    def __init__(self, db: Session):
        self.db = db
        self.chapter_repository = ChapterRepository(db)
        self.course_repository = CourseRepository(db)

    # Create Chapter
    def create_chapter(
        self,
        chapter_data: ChapterCreate,
        current_user: User,
    ) -> Chapter:

        course = self.course_repository.get_course_by_id(
            chapter_data.course_id,
        )

        if not course:
            raise ValueError("Course not found.")

        if course.teacher_id != current_user.id:
            raise PermissionError(
                "You can only add chapters to your own courses."
            )

        chapter = Chapter(
            course_id=chapter_data.course_id,
            title=chapter_data.title,
            description=chapter_data.description,
            order_number=chapter_data.order_number,
        )

        return self.chapter_repository.create_chapter(chapter)

    # Get All Chapters
    def get_all_chapters(self):
        return self.chapter_repository.get_all_chapters()

    # Get Chapter By ID
    def get_chapter_by_id(
        self,
        chapter_id: int,
    ):
        chapter = self.chapter_repository.get_chapter_by_id(
            chapter_id,
        )

        if not chapter:
            raise ValueError("Chapter not found.")

        return chapter

    # Get Chapters By Course
    def get_chapters_by_course(
        self,
        course_id: int,
    ):
        return self.chapter_repository.get_chapters_by_course(
            course_id,
        )

    # Update Chapter
    def update_chapter(
        self,
        chapter_id: int,
        chapter_data: ChapterUpdate,
        current_user: User,
    ):

        chapter = self.get_chapter_by_id(chapter_id)

        course = self.course_repository.get_course_by_id(
            chapter.course_id,
        )

        if course.teacher_id != current_user.id:
            raise PermissionError(
                "You can update only your own chapters."
            )

        update_data = chapter_data.model_dump(
            exclude_unset=True,
        )

        for key, value in update_data.items():
            setattr(chapter, key, value)

        return self.chapter_repository.update_chapter(chapter)

    # Delete Chapter
    def delete_chapter(
        self,
        chapter_id: int,
        current_user: User,
    ):

        chapter = self.get_chapter_by_id(chapter_id)

        course = self.course_repository.get_course_by_id(
            chapter.course_id,
        )

        if course.teacher_id != current_user.id:
            raise PermissionError(
                "You can delete only your own chapters."
            )

        self.chapter_repository.delete_chapter(chapter)

        return {
            "message": "Chapter deleted successfully."
        }