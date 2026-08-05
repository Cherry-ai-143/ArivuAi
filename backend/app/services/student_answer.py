from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.student_answer import StudentAnswerRepository
from app.repositories.assessment_attempt import AssessmentAttemptRepository
from app.repositories.question import QuestionRepository
from app.schemas.student_answer import (
    StudentAnswerCreate,
    StudentAnswerUpdate,
)


class StudentAnswerService:

    def __init__(self, db: Session):
        self.repository = StudentAnswerRepository(db)
        self.attempt_repository = AssessmentAttemptRepository(db)
        self.question_repository = QuestionRepository(db)

    def create_answer(
        self,
        answer_data: StudentAnswerCreate,
        current_user: User,
    ):

        attempt = self.attempt_repository.get_attempt_by_id(
            answer_data.attempt_id
        )

        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment attempt not found",
            )

        if attempt.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to answer this assessment",
            )

        question = self.question_repository.get_question_by_id(
            answer_data.question_id
        )

        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found",
            )

        return self.repository.create_answer(
            answer_data
        )

    def get_answer_by_id(
        self,
        answer_id: int,
    ):

        answer = self.repository.get_answer_by_id(
            answer_id
        )

        if not answer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Answer not found",
            )

        return answer

    def get_attempt_answers(
        self,
        attempt_id: int,
        current_user: User,
    ):

        attempt = self.attempt_repository.get_attempt_by_id(
            attempt_id
        )

        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment attempt not found",
            )

        if (
            attempt.student_id != current_user.id
            and current_user.role.name != "ADMIN"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view these answers",
            )

        return self.repository.get_attempt_answers(
            attempt_id
        )

    def update_answer(
        self,
        answer_id: int,
        answer_data: StudentAnswerUpdate,
        current_user: User,
    ):

        answer = self.get_answer_by_id(
            answer_id
        )

        if (
            answer.attempt.student_id != current_user.id
            and current_user.role.name != "ADMIN"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to update this answer",
            )

        return self.repository.update_answer(
            answer,
            answer_data,
        )

    def delete_answer(
        self,
        answer_id: int,
        current_user: User,
    ):

        answer = self.get_answer_by_id(
            answer_id
        )

        if (
            answer.attempt.student_id != current_user.id
            and current_user.role.name != "ADMIN"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to delete this answer",
            )

        self.repository.delete_answer(
            answer
        )

        return {
            "message": "Student answer deleted successfully"
        }