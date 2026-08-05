from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assessment_attempt import AssessmentAttempt
from app.schemas.assessment_attempt import (
    AssessmentAttemptCreate,
    AssessmentAttemptUpdate,
)


class AssessmentAttemptRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_attempt(
        self,
        attempt_data: AssessmentAttemptCreate,
        student_id: int,
    ) -> AssessmentAttempt:

        attempt = AssessmentAttempt(
            assessment_id=attempt_data.assessment_id,
            student_id=student_id,
        )

        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)

        return attempt

    def get_attempt_by_id(
        self,
        attempt_id: int,
    ) -> AssessmentAttempt | None:

        query = select(AssessmentAttempt).where(
            AssessmentAttempt.id == attempt_id
        )

        result = self.db.execute(query)

        return result.scalar_one_or_none()

    def get_student_attempts(
        self,
        student_id: int,
    ):

        query = select(AssessmentAttempt).where(
            AssessmentAttempt.student_id == student_id
        )

        result = self.db.execute(query)

        return result.scalars().all()

    def get_assessment_attempts(
        self,
        assessment_id: int,
    ):

        query = select(AssessmentAttempt).where(
            AssessmentAttempt.assessment_id == assessment_id
        )

        result = self.db.execute(query)

        return result.scalars().all()

    def update_attempt(
        self,
        attempt: AssessmentAttempt,
        attempt_data: AssessmentAttemptUpdate,
    ) -> AssessmentAttempt:

        update_data = attempt_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(attempt, key, value)

        self.db.commit()
        self.db.refresh(attempt)

        return attempt

    def delete_attempt(
        self,
        attempt: AssessmentAttempt,
    ) -> None:

        self.db.delete(attempt)
        self.db.commit()