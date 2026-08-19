from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.models.user import User
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.assessment import Assessment
from app.enums.assessment import AssessmentStatus
from app.repositories.assessment import AssessmentRepository
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentStatusUpdate,
    AssessmentResponse,
    PublishedAssessmentResponse,
    StudentTakeAssessmentResponse,
    StudentTakeQuestionResponse,
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
        if current_user.role.name == "ADMIN":
            return
        if assessment.created_by != current_user.id:
            course = self.repository.db.query(Course).filter(Course.id == assessment.course_id).first()
            if not course or course.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not allowed to modify this assessment",
                )

    def _check_course_ownership_or_admin(self, course_id: int, current_user: User):
        course = self.repository.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        if current_user.role.name != "ADMIN" and course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to manage assessments for this course",
            )
        return course

    def _validate_assessment_questions(
        self, course_id: int, question_ids: list[int] | None, is_publishing: bool
    ):
        if is_publishing and (not question_ids or len(question_ids) == 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish an assessment with no questions",
            )
        if question_ids:
            from app.models.question import Question
            from app.models.lesson import Lesson
            from app.models.chapter import Chapter

            questions = (
                self.repository.db.query(Question)
                .filter(Question.id.in_(question_ids))
                .all()
            )
            found_ids = {q.id for q in questions}
            missing_ids = set(question_ids) - found_ids
            if missing_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid question IDs: {list(missing_ids)}",
                )

            for q in questions:
                if q.lesson_id:
                    lesson = (
                        self.repository.db.query(Lesson)
                        .options(selectinload(Lesson.chapter))
                        .filter(Lesson.id == q.lesson_id)
                        .first()
                    )
                    if lesson and lesson.chapter and lesson.chapter.course_id != course_id:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Question ID {q.id} belongs to a different course ({lesson.chapter.course_id}) than target course ({course_id})",
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
        self._check_course_ownership_or_admin(assessment_data.course_id, current_user)
        self._validate_assessment_questions(
            course_id=assessment_data.course_id,
            question_ids=assessment_data.question_ids,
            is_publishing=(assessment_data.status == AssessmentStatus.PUBLISHED),
        )

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
        target_course_id = assessment_data.course_id or assessment.course_id
        self._check_course_ownership_or_admin(target_course_id, current_user)

        target_status = assessment_data.status or assessment.status
        target_qids = assessment_data.question_ids if assessment_data.question_ids is not None else [aq.question_id for aq in (assessment.assessment_questions or [])]
        self._validate_assessment_questions(
            course_id=target_course_id,
            question_ids=target_qids,
            is_publishing=(target_status == AssessmentStatus.PUBLISHED),
        )

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

        existing_qids = [aq.question_id for aq in (assessment.assessment_questions or [])]
        self._validate_assessment_questions(
            course_id=assessment.course_id,
            question_ids=existing_qids,
            is_publishing=(status_data.status == AssessmentStatus.PUBLISHED),
        )

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
            course_id=assessment.course_id,
            course_title=assessment.course.title if assessment.course else None,
            created_at=assessment.created_at,
            question_count=question_count,
            total_marks=total_marks,
            attempts_used=attempts_used,
            attempts_remaining=attempts_remaining,
        )

    def get_available_assessments_for_student(
        self,
        current_user: User,
    ) -> list[PublishedAssessmentResponse]:
        if current_user.role.name != "STUDENT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can view available assessments",
            )

        enrollments = (
            self.repository.db.query(CourseEnrollment)
            .filter(
                CourseEnrollment.student_id == current_user.id,
                CourseEnrollment.status.in_([
                    EnrollmentStatus.ENROLLED,
                    EnrollmentStatus.IN_PROGRESS,
                    EnrollmentStatus.COMPLETED,
                ]),
            )
            .all()
        )
        enrolled_course_ids = [e.course_id for e in enrollments]
        if not enrolled_course_ids:
            return []

        assessments = (
            self.repository.db.query(Assessment)
            .options(selectinload(Assessment.assessment_questions), selectinload(Assessment.course))
            .filter(
                Assessment.status == AssessmentStatus.PUBLISHED,
                Assessment.course_id.in_(enrolled_course_ids),
            )
            .order_by(Assessment.created_at.desc())
            .all()
        )

        results = []
        for a in assessments:
            aqs = a.assessment_questions or []
            question_count = len(aqs)
            total_marks = sum(aq.marks for aq in aqs)
            attempts_used = self.repository.get_student_attempts_count(a.id, current_user.id)
            attempts_remaining = max(0, a.max_attempts - attempts_used)

            results.append(
                PublishedAssessmentResponse(
                    id=a.id,
                    title=a.title,
                    description=a.description,
                    assessment_type=a.assessment_type,
                    scope=a.scope,
                    duration_minutes=a.duration_minutes,
                    passing_score=a.passing_score,
                    max_attempts=a.max_attempts,
                    course_id=a.course_id,
                    course_title=a.course.title if a.course else None,
                    created_at=a.created_at,
                    question_count=question_count,
                    total_marks=total_marks,
                    attempts_used=attempts_used,
                    attempts_remaining=attempts_remaining,
                )
            )
        return results

    def get_assessment_for_student_take(
        self,
        assessment_id: int,
        current_user: User,
    ) -> StudentTakeAssessmentResponse:
        if current_user.role.name != "STUDENT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can take assessments",
            )

        assessment = self.repository.get_assessment_by_id(assessment_id)
        if not assessment or assessment.status != AssessmentStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Published assessment not found",
            )

        enrollment = (
            self.repository.db.query(CourseEnrollment)
            .filter(
                CourseEnrollment.student_id == current_user.id,
                CourseEnrollment.course_id == assessment.course_id,
                CourseEnrollment.status.in_([
                    EnrollmentStatus.ENROLLED,
                    EnrollmentStatus.IN_PROGRESS,
                    EnrollmentStatus.COMPLETED,
                ]),
            )
            .first()
        )
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in the course for this assessment",
            )

        aqs = assessment.assessment_questions or []
        questions_list = []
        for idx, aq in enumerate(aqs, start=1):
            q = aq.question
            if q:
                questions_list.append(
                    StudentTakeQuestionResponse(
                        question_id=q.id,
                        order_number=aq.order_number or idx,
                        marks=aq.marks or q.marks or 1,
                        question_text=q.question_text,
                        question_type=str(q.question_type.value if hasattr(q.question_type, 'value') else q.question_type),
                        option_a=q.option_a,
                        option_b=q.option_b,
                        option_c=q.option_c,
                        option_d=q.option_d,
                    )
                )

        return StudentTakeAssessmentResponse(
            id=assessment.id,
            title=assessment.title,
            description=assessment.description,
            assessment_type=assessment.assessment_type,
            scope=assessment.scope,
            duration_minutes=assessment.duration_minutes,
            passing_score=assessment.passing_score,
            max_attempts=assessment.max_attempts,
            total_marks=sum(aq.marks for aq in aqs),
            question_count=len(questions_list),
            questions=questions_list,
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