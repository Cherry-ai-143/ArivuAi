from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chapter import Chapter


class ChapterRepository:
    def __init__(self, db: Session):
        self.db = db

    # Create Chapter
    def create_chapter(self, chapter: Chapter) -> Chapter:
        self.db.add(chapter)
        self.db.commit()
        self.db.refresh(chapter)
        return chapter

    # Get All Chapters
    def get_all_chapters(self) -> list[Chapter]:
        query = (
            select(Chapter)
            .order_by(
                Chapter.order_number,
                Chapter.id,
            )
        )

        result = self.db.execute(query)
        return list(result.scalars().all())

    # Get Chapter By ID
    def get_chapter_by_id(self, chapter_id: int) -> Chapter | None:
        query = select(Chapter).where(
            Chapter.id == chapter_id,
        )

        result = self.db.execute(query)
        return result.scalar_one_or_none()

    # Get Chapters By Course
    def get_chapters_by_course(
        self,
        course_id: int,
    ) -> list[Chapter]:
        query = (
            select(Chapter)
            .where(
                Chapter.course_id == course_id,
            )
            .order_by(
                Chapter.order_number,
            )
        )

        result = self.db.execute(query)
        return list(result.scalars().all())

    # Update Chapter
    def update_chapter(
        self,
        chapter: Chapter,
    ) -> Chapter:
        self.db.commit()
        self.db.refresh(chapter)
        return chapter

    # Delete Chapter
    def delete_chapter(
        self,
        chapter: Chapter,
    ) -> None:
        self.db.delete(chapter)
        self.db.commit()