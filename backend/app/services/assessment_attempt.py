# Date & Time
from datetime import datetime, timezone

# FastAPI
from fastapi import HTTPException, status

# SQLAlchemy
from sqlalchemy.orm import Session

# Models
from app.models.user import User
from app.models.assessment_attempt import AttemptStatus

# Repositories
from app.repositories.assessment import AssessmentRepository
from app.repositories.assessment_attempt import AssessmentAttemptRepository
from app.repositories.student_answer import StudentAnswerRepository
from app.repositories.question import QuestionRepository

# Schemas
from app.schemas.assessment_attempt import (
    AssessmentAttemptCreate,
    AssessmentAttemptUpdate,
)


class AssessmentAttemptService:

    # Constructor
    def __init__(self, db: Session):

        # Assessment Attempt Repository
        self.repository = AssessmentAttemptRepository(db)

        # Assessment Repository
        self.assessment_repository = AssessmentRepository(db)

        # Student Answer Repository
        self.student_answer_repository = StudentAnswerRepository(db)

        # Question Repository
        self.question_repository = QuestionRepository(db)

    # Create Assessment Attempt
    def create_attempt(
        self,
        attempt_data: AssessmentAttemptCreate,
        current_user: User,
    ):
        # Only students can start assessments
        if current_user.role.name != "STUDENT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can start assessments",
            )

        assessment = self.assessment_repository.get_assessment_by_id(
            attempt_data.assessment_id
        )

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found",
            )

        return self.repository.create_attempt(
            attempt_data,
            current_user.id,
        )

    # Get Attempt By ID
    def get_attempt_by_id(
        self,
        attempt_id: int,
    ):
        attempt = self.repository.get_attempt_by_id(
            attempt_id
        )

        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attempt not found",
            )

        return attempt

    # Get Logged-in Student Attempts
    def get_my_attempts(
        self,
        current_user: User,
    ):
        return self.repository.get_student_attempts(
            current_user.id
        )

    # Get All Attempts for an Assessment
    def get_assessment_attempts(
        self,
        assessment_id: int,
    ):
        return self.repository.get_assessment_attempts(
            assessment_id
        )

    # Evaluate Student Answers
    def _evaluate_attempt(
        self,
        attempt,
    ):

        # Get all answers for this attempt
        answers = self.student_answer_repository.get_attempt_answers(
            attempt.id
        )

        total_score = 0

        # Check every answer
        for answer in answers:

            question = self.question_repository.get_question_by_id(
                answer.question_id
            )

            # Correct answer
            if answer.selected_option == question.correct_option:
                answer.is_correct = True
                answer.marks_obtained = question.marks
                total_score += question.marks

            # Wrong answer
            else:
                answer.is_correct = False
                answer.marks_obtained = 0

        # Save total score
        attempt.score = total_score

        # Commit changes
        self.repository.db.commit()
        self.repository.db.refresh(attempt)

        return total_score

    # Submit Assessment Attempt
    def submit_attempt(
        self,
        attempt_id: int,
        current_user: User,
    ):
        attempt = self.get_attempt_by_id(
            attempt_id
        )

        if attempt.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to submit this attempt",
            )

        if attempt.status == AttemptStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment already submitted",
            )

        update_data = AssessmentAttemptUpdate(
            status=AttemptStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
        )

        # Update attempt
        attempt = self.repository.update_attempt(
            attempt,
            update_data,
        )

        # Evaluate answers
        self._evaluate_attempt(
            attempt
        )

        return attempt

    # Delete Assessment Attempt
    def delete_attempt(
        self,
        attempt_id: int,
        current_user: User,
    ):
        attempt = self.get_attempt_by_id(
            attempt_id
        )

        if (
            attempt.student_id != current_user.id
            and current_user.role.name != "ADMIN"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to delete this attempt",
            )

        self.repository.delete_attempt(
            attempt
        )

        return {
            "message": "Assessment attempt deleted successfully"
        }