from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.enums.assignment import AssignmentStatus, SubmissionStatus
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.course import Course
from app.models.user import User
from app.repositories.assignment import AssignmentRepository
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentDetailResponse,
    AssignmentResponse,
    AssignmentStatsResponse,
    AssignmentUpdate,
    RubricCriterionResponse,
    SubmissionCreate,
    SubmissionDetailResponse,
    SubmissionGrade,
    SubmissionResponse,
)


class AssignmentService:

    def __init__(self, db: Session):
        self.db = db
        self.repo = AssignmentRepository(db)

    def _is_admin(self, user: User) -> bool:
        role_str = str(user.role.value if hasattr(user.role, 'value') else user.role).lower()
        return role_str == "admin"

    # ----------------------------------------------------
    # Teacher Assignment Operations
    # ----------------------------------------------------
    def create_assignment(self, current_user: User, data: AssignmentCreate) -> AssignmentDetailResponse:
        # Validate course ownership
        course = self.db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        if course.teacher_id != current_user.id and not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this course"
            )

        assignment = self.repo.create_assignment(current_user.id, data)
        return self._format_assignment_detail(assignment)


    def update_assignment(
        self, assignment_id: int, current_user: User, data: AssignmentUpdate
    ) -> AssignmentDetailResponse:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        if assignment.teacher_id != current_user.id and not self._is_admin(current_user):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )

        updated = self.repo.update_assignment(assignment_id, data)
        if not updated:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update assignment")
        return self._format_assignment_detail(updated)

    def publish_assignment(self, assignment_id: int, current_user: User) -> AssignmentDetailResponse:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        if assignment.teacher_id != current_user.id and not self._is_admin(current_user):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )

        updated = self.repo.update_assignment(
            assignment_id, AssignmentUpdate(status=AssignmentStatus.ACTIVE)
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to publish assignment")
        return self._format_assignment_detail(updated)


    def duplicate_assignment(self, assignment_id: int, current_user: User) -> AssignmentDetailResponse:
        existing = self.repo.get_assignment_by_id(assignment_id)
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        if existing.teacher_id != current_user.id and not self._is_admin(current_user):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )

        create_data = AssignmentCreate(
            course_id=existing.course_id,
            lesson_id=existing.lesson_id,
            title=f"{existing.title} (Copy)",
            description=existing.description,
            instructions=existing.instructions,
            assignment_type=existing.assignment_type,
            difficulty=existing.difficulty,
            max_points=existing.max_points,
            due_date=existing.due_date,
            status=AssignmentStatus.DRAFT,
            submission_config=existing.submission_config,
            grading_config=existing.grading_config,
            type_config=existing.type_config,
            rubric_criteria=[
                {
                    "criterion_name": r.criterion_name,
                    "max_points": r.max_points,
                    "description": r.description,
                    "order_index": r.order_index,
                }
                for r in existing.rubric_criteria
            ],
        )

        duplicated = self.repo.create_assignment(current_user.id, create_data)
        return self._format_assignment_detail(duplicated)

    def delete_assignment(self, assignment_id: int, current_user: User) -> bool:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        if assignment.teacher_id != current_user.id and not self._is_admin(current_user):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )
        return self.repo.delete_assignment(assignment_id)

    def get_assignment_detail(self, assignment_id: int, current_user: User) -> AssignmentDetailResponse:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        return self._format_assignment_detail(assignment)

    def list_teacher_assignments(
        self,
        current_user: User,
        status_filter: Optional[str] = None,
        course_id: Optional[int] = None,
        assignment_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[AssignmentResponse]:
        assignments = self.repo.list_teacher_assignments(
            teacher_id=current_user.id,
            status=status_filter,
            course_id=course_id,
            assignment_type=assignment_type,
            difficulty=difficulty,
            search=search,
        )
        return [self._format_assignment_summary(a) for a in assignments]

    def get_teacher_stats(self, current_user: User) -> AssignmentStatsResponse:
        stats = self.repo.get_teacher_stats(current_user.id)
        return AssignmentStatsResponse(**stats)

    # ----------------------------------------------------
    # Student Assignment Operations
    # ----------------------------------------------------
    def list_student_assignments(
        self,
        current_user: User,
        status_filter: Optional[str] = None,
        course_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        results = self.repo.list_student_assignments(
            student_id=current_user.id,
            status=status_filter,
            course_id=course_id,
            search=search,
        )

        output = []
        for assignment, submission in results:
            item = {
                "id": assignment.id,
                "course_id": assignment.course_id,
                "course_title": assignment.course.title if assignment.course else None,
                "lesson_id": assignment.lesson_id,
                "lesson_title": assignment.lesson.title if assignment.lesson else None,
                "title": assignment.title,
                "description": assignment.description,
                "assignment_type": assignment.assignment_type,
                "difficulty": assignment.difficulty,
                "max_points": assignment.max_points,
                "due_date": assignment.due_date,
                "submission_status": submission.status if submission else SubmissionStatus.NOT_STARTED,
                "score": submission.score if submission else None,
                "is_late": submission.is_late if submission else False,
                "submitted_at": submission.submitted_at if submission else None,
            }
            output.append(item)

        return output

    def get_student_assignment_detail(self, assignment_id: int, current_user: User) -> Dict[str, Any]:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

        submission = self.repo.get_student_submission(assignment_id, current_user.id)
        detail = self._format_assignment_detail(assignment).model_dump()

        detail["my_submission"] = (
            SubmissionResponse.model_validate(submission).model_dump() if submission else None
        )
        return detail

    def submit_assignment(
        self, assignment_id: int, current_user: User, data: SubmissionCreate
    ) -> SubmissionResponse:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

        existing_submission = self.repo.get_student_submission(assignment_id, current_user.id)
        if existing_submission and existing_submission.status in [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED, SubmissionStatus.UNDER_REVIEW]:
            if not data.is_draft and existing_submission.status != SubmissionStatus.RESUBMISSION_REQUIRED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assignment already submitted and locked for review",
                )

        submission = self.repo.create_or_update_submission(assignment, current_user.id, data)
        return SubmissionResponse.model_validate(submission)

    # ----------------------------------------------------
    # Submission Review & Grading Operations
    # ----------------------------------------------------
    def list_assignment_submissions(self, assignment_id: int, current_user: User) -> List[SubmissionDetailResponse]:
        assignment = self.repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        if assignment.teacher_id != current_user.id and not self._is_admin(current_user):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )

        submissions = self.repo.list_assignment_submissions(assignment_id)
        output = []
        for s in submissions:
            detail = self._format_submission_detail(s)
            output.append(detail)
        return output

    def get_submission_detail(self, submission_id: int, current_user: User) -> SubmissionDetailResponse:
        submission = self.repo.get_submission_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

        # Allow access if student owns submission OR teacher owns assignment OR admin
        is_student = submission.student_id == current_user.id
        is_teacher = submission.assignment.teacher_id == current_user.id
        if not (is_student or is_teacher or self._is_admin(current_user)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this submission"
            )

        return self._format_submission_detail(submission)

    def grade_submission(
        self, submission_id: int, current_user: User, grade_data: SubmissionGrade
    ) -> SubmissionDetailResponse:
        submission = self.repo.get_submission_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        if submission.assignment.teacher_id != current_user.id and not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )

        if grade_data.score > submission.assignment.max_points:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Score cannot exceed max points ({submission.assignment.max_points})",
            )

        graded = self.repo.grade_submission(submission_id, current_user.id, grade_data)
        return self._format_submission_detail(graded)

    def request_resubmission(
        self, submission_id: int, current_user: User, reason: str
    ) -> SubmissionDetailResponse:
        submission = self.repo.get_submission_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        if submission.assignment.teacher_id != current_user.id and not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment"
            )


        resubmitted = self.repo.request_resubmission(submission_id, reason)
        return self._format_submission_detail(resubmitted)

    # ----------------------------------------------------
    # Private Helpers
    # ----------------------------------------------------
    def _format_assignment_detail(self, assignment: Assignment) -> AssignmentDetailResponse:
        submissions = assignment.submissions or []
        total_submissions = len(submissions)
        pending_count = sum(
            1 for s in submissions if s.status in [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.LATE]
        )
        scores = [s.score for s in submissions if s.score is not None]
        avg_score = (sum(scores) / len(scores)) if scores else None

        rubrics = [
            RubricCriterionResponse.model_validate(r) for r in (assignment.rubric_criteria or [])
        ]

        return AssignmentDetailResponse(
            id=assignment.id,
            course_id=assignment.course_id,
            lesson_id=assignment.lesson_id,
            teacher_id=assignment.teacher_id,
            title=assignment.title,
            description=assignment.description,
            instructions=assignment.instructions,
            assignment_type=assignment.assignment_type,
            difficulty=assignment.difficulty,
            max_points=assignment.max_points,
            due_date=assignment.due_date,
            status=assignment.status,
            submission_config=assignment.submission_config,
            grading_config=assignment.grading_config,
            type_config=assignment.type_config,
            created_at=assignment.created_at,
            updated_at=assignment.updated_at,
            published_at=assignment.published_at,
            course_title=assignment.course.title if assignment.course else None,
            lesson_title=assignment.lesson.title if assignment.lesson else None,
            total_submissions=total_submissions,
            total_enrolled=0,
            average_score=avg_score,
            pending_review_count=pending_count,
            rubric_criteria=rubrics,
        )

    def _format_assignment_summary(self, assignment: Assignment) -> AssignmentResponse:
        submissions = assignment.submissions or []
        total_submissions = len(submissions)
        pending_count = sum(
            1 for s in submissions if s.status in [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.LATE]
        )
        scores = [s.score for s in submissions if s.score is not None]
        avg_score = (sum(scores) / len(scores)) if scores else None

        return AssignmentResponse(
            id=assignment.id,
            course_id=assignment.course_id,
            lesson_id=assignment.lesson_id,
            teacher_id=assignment.teacher_id,
            title=assignment.title,
            description=assignment.description,
            instructions=assignment.instructions,
            assignment_type=assignment.assignment_type,
            difficulty=assignment.difficulty,
            max_points=assignment.max_points,
            due_date=assignment.due_date,
            status=assignment.status,
            submission_config=assignment.submission_config,
            grading_config=assignment.grading_config,
            type_config=assignment.type_config,
            created_at=assignment.created_at,
            updated_at=assignment.updated_at,
            published_at=assignment.published_at,
            course_title=assignment.course.title if assignment.course else None,
            lesson_title=assignment.lesson.title if assignment.lesson else None,
            total_submissions=total_submissions,
            average_score=avg_score,
            pending_review_count=pending_count,
        )

    def _format_submission_detail(self, s: AssignmentSubmission) -> SubmissionDetailResponse:
        rubrics = [
            RubricCriterionResponse.model_validate(r)
            for r in (s.assignment.rubric_criteria if s.assignment else [])
        ]
        student_name = s.student.full_name if (s.student and hasattr(s.student, "full_name")) else f"Student #{s.student_id}"

        return SubmissionDetailResponse(
            id=s.id,
            assignment_id=s.assignment_id,
            student_id=s.student_id,
            status=s.status,
            text_response=s.text_response,
            external_url=s.external_url,
            file_ids=s.file_ids,
            submitted_at=s.submitted_at,
            created_at=s.created_at,
            updated_at=s.updated_at,
            is_late=s.is_late,
            score=s.score,
            feedback=s.feedback,
            rubric_scores=s.rubric_scores,
            graded_at=s.graded_at,
            graded_by=s.graded_by,
            resubmission_reason=s.resubmission_reason,
            student_name=student_name,
            student_email=s.student.email if s.student else None,
            student_avatar=getattr(s.student, "avatar", None),
            assignment_title=s.assignment.title if s.assignment else None,
            assignment_max_points=s.assignment.max_points if s.assignment else 100,
            assignment_instructions=s.assignment.instructions if s.assignment else None,
            assignment_type=s.assignment.assignment_type if s.assignment else None,
            rubric_criteria=rubrics,
        )
