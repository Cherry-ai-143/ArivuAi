from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_answer import StudentAnswer
from app.schemas.student_answer import (
    StudentAnswerCreate,
    StudentAnswerUpdate,
)


class StudentAnswerRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_answer(
        self,
        answer_data: StudentAnswerCreate,
    ) -> StudentAnswer:

        answer = StudentAnswer(
            attempt_id=answer_data.attempt_id,
            question_id=answer_data.question_id,
            selected_option=answer_data.selected_option,
        )

        self.db.add(answer)
        self.db.commit()
        self.db.refresh(answer)

        return answer

    def get_answer_by_id(
        self,
        answer_id: int,
    ) -> StudentAnswer | None:

        query = select(StudentAnswer).where(
            StudentAnswer.id == answer_id
        )

        result = self.db.execute(query)
        return result.scalar_one_or_none()

    def get_attempt_answers(
        self,
        attempt_id: int,
    ):

        query = select(StudentAnswer).where(
            StudentAnswer.attempt_id == attempt_id
        )

        result = self.db.execute(query)
        return result.scalars().all()

    def update_answer(
        self,
        answer: StudentAnswer,
        answer_data: StudentAnswerUpdate,
    ) -> StudentAnswer:

        update_data = answer_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(answer, key, value)

        self.db.commit()
        self.db.refresh(answer)

        return answer

    def delete_answer(
        self,
        answer: StudentAnswer,
    ) -> None:

        self.db.delete(answer)
        self.db.commit()