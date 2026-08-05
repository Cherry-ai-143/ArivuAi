from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.assessment import Assessment
from app.models.assessment_question import AssessmentQuestion
from app.models.assessment_attempt import AssessmentAttempt
from app.enums.assessment import AssessmentStatus
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate


class AssessmentRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_assessment(
        self,
        assessment_data: AssessmentCreate,
        created_by: int,
    ) -> Assessment:
        # Extract question_ids (not a column on Assessment)
        question_ids = list(assessment_data.question_ids or [])
        data = assessment_data.model_dump(exclude={"question_ids"})

        assessment = Assessment(
            **data,
            created_by=created_by,
        )

        self.db.add(assessment)
        self.db.flush()  # get assessment.id without full commit

        # Create bridge entries
        self._sync_assessment_questions(assessment, question_ids)

        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def _sync_assessment_questions(
        self,
        assessment: Assessment,
        question_ids: list[int],
    ) -> None:
        """Replace the assessment's bridge questions with the given list."""
        # Remove existing bridge entries
        existing = self.db.execute(
            select(AssessmentQuestion).where(
                AssessmentQuestion.assessment_id == assessment.id
            )
        ).scalars().all()
        for aq in existing:
            self.db.delete(aq)
        self.db.flush()

        # Add new bridge entries
        for idx, qid in enumerate(question_ids, start=1):
            bridge = AssessmentQuestion(
                assessment_id=assessment.id,
                question_id=qid,
                order_number=idx,
                marks=1,
            )
            self.db.add(bridge)
        self.db.flush()

    def get_all_assessments(
        self,
        course_id: int | None = None,
        status: AssessmentStatus | None = None,
        scope: str | None = None,
    ):
        query = select(Assessment).options(
            selectinload(Assessment.assessment_questions)
        )
        if course_id is not None:
            query = query.where(Assessment.course_id == course_id)
        if status is not None:
            query = query.where(Assessment.status == status)
        if scope is not None:
            query = query.where(Assessment.scope == scope)
        query = query.order_by(Assessment.created_at.desc())
        result = self.db.execute(query)
        return result.scalars().all()

    def get_assessment_by_id(
        self,
        assessment_id: int,
    ) -> Assessment | None:
        query = (
            select(Assessment)
            .options(selectinload(Assessment.assessment_questions))
            .where(Assessment.id == assessment_id)
        )
        result = self.db.execute(query)
        return result.scalar_one_or_none()

    def update_assessment(
        self,
        assessment: Assessment,
        assessment_data: AssessmentUpdate,
    ) -> Assessment:
        update_data = assessment_data.model_dump(exclude_unset=True)

        # Handle bridge questions separately
        question_ids = update_data.pop("question_ids", None)

        for key, value in update_data.items():
            setattr(assessment, key, value)

        if question_ids is not None:
            self._sync_assessment_questions(assessment, question_ids)

        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def update_status(
        self,
        assessment: Assessment,
        status: AssessmentStatus,
    ) -> Assessment:
        assessment.status = status
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_published_assessment_for_lesson(
        self,
        lesson_id: int,
    ) -> Assessment | None:
        query = (
            select(Assessment)
            .options(selectinload(Assessment.assessment_questions))
            .where(
                Assessment.lesson_id == lesson_id,
                Assessment.status == AssessmentStatus.PUBLISHED,
            )
            .order_by(Assessment.created_at.desc())
            .limit(1)
        )
        result = self.db.execute(query)
        return result.scalar_one_or_none()

    def get_student_attempts_count(
        self,
        assessment_id: int,
        student_id: int,
    ) -> int:
        from app.models.assessment_attempt import AttemptStatus
        query = (
            select(AssessmentAttempt)
            .where(
                AssessmentAttempt.assessment_id == assessment_id,
                AssessmentAttempt.student_id == student_id,
            )
        )
        result = self.db.execute(query)
        return len(result.scalars().all())

    def delete_assessment(
        self,
        assessment: Assessment,
    ) -> None:
        self.db.delete(assessment)
        self.db.commit()