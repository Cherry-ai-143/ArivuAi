from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assessment_attempt import AssessmentAttempt
from app.models.student_answer import StudentAnswer


class ResultRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_attempt_by_id(
        self,
        attempt_id: int,
    ) -> AssessmentAttempt | None:

        query = select(AssessmentAttempt).where(
            AssessmentAttempt.id == attempt_id
        )

        result = self.db.execute(query)

        return result.scalar_one_or_none()

    def get_answers_by_attempt(
        self,
        attempt_id: int,
    ):

        query = select(StudentAnswer).where(
            StudentAnswer.attempt_id == attempt_id
        )

        result = self.db.execute(query)

        return result.scalars().all()