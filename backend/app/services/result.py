from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.assessment import AssessmentRepository
from app.repositories.assessment_attempt import AssessmentAttemptRepository
from app.repositories.question import QuestionRepository
from app.repositories.student_answer import StudentAnswerRepository
from app.schemas.result import AssessmentResultResponse


class ResultService:

    def __init__(self, db: Session):

        self.attempt_repository = AssessmentAttemptRepository(db)

        self.answer_repository = StudentAnswerRepository(db)

        self.question_repository = QuestionRepository(db)

        self.assessment_repository = AssessmentRepository(db)

    def get_result(
        self,
        attempt_id: int,
        current_user: User,
    ):

        # Get Attempt
        attempt = self.attempt_repository.get_attempt_by_id(
            attempt_id
        )

        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attempt not found",
            )

        # Permission Check
        if (
            attempt.student_id != current_user.id
            and current_user.role.name != "ADMIN"
            and current_user.role.name != "TEACHER"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this result",
            )

        # Get Assessment
        assessment = self.assessment_repository.get_assessment_by_id(
            attempt.assessment_id
        )

        # Get Questions
        questions = (
            self.question_repository.get_questions_by_assessment(
                attempt.assessment_id
            )
        )

        # Get Student Answers
        answers = (
            self.answer_repository.get_attempt_answers(
                attempt.id
            )
        )

        total_questions = len(questions)

        attempted_questions = len(answers)

        correct_answers = sum(
            1
            for answer in answers
            if answer.is_correct
        )

        wrong_answers = attempted_questions - correct_answers

        total_marks = sum(
            question.marks
            for question in questions
        )

        obtained_marks = sum(
            answer.marks_obtained
            for answer in answers
        )

        percentage = (
            (obtained_marks / total_marks) * 100
            if total_marks > 0
            else 0
        )

        status_result = (
            "PASS"
            if percentage >= 40
            else "FAIL"
        )

        time_taken = 0

        if attempt.submitted_at:

            time_taken = (
                attempt.submitted_at
                - attempt.started_at
            ).total_seconds() / 60

        return AssessmentResultResponse(
            attempt_id=attempt.id,
            assessment_title=assessment.title,
            total_questions=total_questions,
            attempted_questions=attempted_questions,
            correct_answers=correct_answers,
            wrong_answers=wrong_answers,
            total_marks=total_marks,
            obtained_marks=obtained_marks,
            percentage=round(
                percentage,
                2,
            ),
            status=status_result,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            time_taken_minutes=round(
                time_taken,
                2,
            ),
        )