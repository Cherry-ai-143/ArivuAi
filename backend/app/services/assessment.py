from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.assessment import Assessment
from app.enums.assessment import AssessmentStatus
from app.repositories.assessment import AssessmentRepository
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentStatusUpdate,
    AssessmentResponse,
    PublishedAssessmentResponse,
)


class AssessmentService:

    def __init__(self, db: Session):
        self.repository = AssessmentRepository(db)

    def _check_teacher_or_admin(self, current_user: User):
        if current_user.role.name not in ["TEACHER", "ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers and admins can manage assessments",
            )

    def _check_owner_or_admin(self, assessment: Assessment, current_user: User):
        if (
            assessment.created_by != current_user.id
            and current_user.role.name != "ADMIN"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to modify this assessment",
            )

    def _to_response(self, assessment: Assessment) -> AssessmentResponse:
        """Build an AssessmentResponse with computed fields."""
        aqs = assessment.assessment_questions or []
        return AssessmentResponse(
            id=assessment.id,
            title=assessment.title,
            description=assessment.description,
            assessment_type=assessment.assessment_type,
            scope=assessment.scope,
            status=assessment.status,
            course_id=assessment.course_id,
            chapter_id=assessment.chapter_id,
            lesson_id=assessment.lesson_id,
            duration_minutes=assessment.duration_minutes,
            passing_score=assessment.passing_score,
            max_attempts=assessment.max_attempts,
            shuffle_questions=assessment.shuffle_questions,
            shuffle_options=assessment.shuffle_options,
            show_correct_answers=assessment.show_correct_answers,
            created_by=assessment.created_by,
            created_at=assessment.created_at,
            updated_at=assessment.updated_at,
            total_marks=sum(aq.marks for aq in aqs),
            question_count=len(aqs),
            assessment_questions=aqs,
        )

    def create_assessment(
        self,
        assessment_data: AssessmentCreate,
        current_user: User,
    ) -> AssessmentResponse:
        self._check_teacher_or_admin(current_user)

        assessment = self.repository.create_assessment(
            assessment_data=assessment_data,
            created_by=current_user.id,
        )
        return self._to_response(assessment)

    def get_all_assessments(
        self,
        course_id: int | None = None,
        status_filter: AssessmentStatus | None = None,
        scope: str | None = None,
    ) -> list[AssessmentResponse]:
        assessments = self.repository.get_all_assessments(
            course_id=course_id,
            status=status_filter,
            scope=scope,
        )
        return [self._to_response(a) for a in assessments]

    def get_assessment_by_id(self, assessment_id: int) -> AssessmentResponse:
        assessment = self.repository.get_assessment_by_id(assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found",
            )
        return self._to_response(assessment)

    def update_assessment(
        self,
        assessment_id: int,
        assessment_data: AssessmentUpdate,
        current_user: User,
    ) -> AssessmentResponse:
        self._check_teacher_or_admin(current_user)
        assessment = self.repository.get_assessment_by_id(assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found",
            )
        self._check_owner_or_admin(assessment, current_user)

        updated = self.repository.update_assessment(assessment, assessment_data)
        return self._to_response(updated)

    def update_status(
        self,
        assessment_id: int,
        status_data: AssessmentStatusUpdate,
        current_user: User,
    ) -> AssessmentResponse:
        self._check_teacher_or_admin(current_user)
        assessment = self.repository.get_assessment_by_id(assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found",
            )
        self._check_owner_or_admin(assessment, current_user)

        updated = self.repository.update_status(assessment, status_data.status)
        return self._to_response(updated)

    def get_published_assessment_for_lesson(
        self,
        lesson_id: int,
        current_user: User,
    ) -> PublishedAssessmentResponse | None:
        assessment = self.repository.get_published_assessment_for_lesson(lesson_id)
        if not assessment:
            return None

        aqs = assessment.assessment_questions or []
        question_count = len(aqs)
        total_marks = sum(aq.marks for aq in aqs)

        attempts_used = self.repository.get_student_attempts_count(
            assessment.id,
            current_user.id,
        )
        attempts_remaining = max(0, assessment.max_attempts - attempts_used)

        return PublishedAssessmentResponse(
            id=assessment.id,
            title=assessment.title,
            description=assessment.description,
            assessment_type=assessment.assessment_type,
            scope=assessment.scope,
            duration_minutes=assessment.duration_minutes,
            passing_score=assessment.passing_score,
            max_attempts=assessment.max_attempts,
            question_count=question_count,
            total_marks=total_marks,
            attempts_used=attempts_used,
            attempts_remaining=attempts_remaining,
        )

    def delete_assessment(
        self,
        assessment_id: int,
        current_user: User,
    ):
        self._check_teacher_or_admin(current_user)
        assessment = self.repository.get_assessment_by_id(assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found",
            )
        self._check_owner_or_admin(assessment, current_user)

        self.repository.delete_assessment(assessment)
        return {"message": "Assessment deleted successfully"}