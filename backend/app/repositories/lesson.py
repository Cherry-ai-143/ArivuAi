from sqlalchemy.orm import Session

from app.models.lesson import Lesson
from app.schemas.lesson import (
    LessonCreate,
    LessonUpdate,
)


class LessonRepository:

    def __init__(self, db: Session):
        self.db = db

    # Create Lesson
    def create(
        self,
        lesson_data: LessonCreate,
    ) -> Lesson:

        lesson = Lesson(
            **lesson_data.model_dump(),
        )

        self.db.add(lesson)
        self.db.commit()
        self.db.refresh(lesson)

        return lesson

    # Get All Lessons
    def get_all(self) -> list[Lesson]:

        return (
            self.db.query(Lesson)
            .all()
        )

    # Get Lesson By ID
    def get_by_id(
        self,
        lesson_id: int,
    ) -> Lesson | None:

        return (
            self.db.query(Lesson)
            .filter(Lesson.id == lesson_id)
            .first()
        )

    # Update Lesson
    def update(
        self,
        lesson: Lesson,
        lesson_data: LessonUpdate,
    ) -> Lesson:

        update_data = lesson_data.model_dump(
            exclude_unset=True,
        )

        for key, value in update_data.items():
            setattr(
                lesson,
                key,
                value,
            )

        self.db.commit()
        self.db.refresh(lesson)

        return lesson

    # Delete Lesson
    def delete(
        self,
        lesson: Lesson,
    ):

        self.db.delete(lesson)
        self.db.commit()