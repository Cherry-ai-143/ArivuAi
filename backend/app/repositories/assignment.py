from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import func, select, or_, and_, desc, asc
from sqlalchemy.orm import Session, selectinload

from app.enums.assignment import (
    AssignmentDifficulty,
    AssignmentStatus,
    AssignmentType,
    SubmissionStatus,
)
from app.models.assignment import Assignment, AssignmentRubric, AssignmentSubmission
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, SubmissionCreate, SubmissionGrade


class AssignmentRepository:

    def __init__(self, db: Session):
        self.db = db

    # ----------------------------------------------------
    # Assignment Management
    # ----------------------------------------------------
    def create_assignment(self, teacher_id: int, data: AssignmentCreate) -> Assignment:
        rubric_data = data.rubric_criteria or []
        create_dict = data.model_dump(exclude={"rubric_criteria"})
        create_dict["teacher_id"] = teacher_id

        if data.status == AssignmentStatus.ACTIVE and not create_dict.get("published_at"):
            create_dict["published_at"] = datetime.now(timezone.utc)

        assignment = Assignment(**create_dict)
        self.db.add(assignment)
        self.db.flush()

        # Add rubric criteria if provided
        for idx, item in enumerate(rubric_data):
            rubric = AssignmentRubric(
                assignment_id=assignment.id,
                criterion_name=item.criterion_name,
                max_points=item.max_points,
                description=item.description,
                order_index=item.order_index if item.order_index is not None else idx,
            )
            self.db.add(rubric)

        self.db.commit()
        self.db.refresh(assignment)
        res = self.get_assignment_by_id(assignment.id)
        if not res:
            return assignment
        return res


    def update_assignment(self, assignment_id: int, data: AssignmentUpdate) -> Optional[Assignment]:
        assignment = self.db.query(Assignment).filter(Assignment.id == assignment_id).first()
        if not assignment:
            return None

        update_dict = data.model_dump(exclude_unset=True, exclude={"rubric_criteria"})

        if update_dict.get("status") == AssignmentStatus.ACTIVE and not assignment.published_at:
            update_dict["published_at"] = datetime.now(timezone.utc)

        for key, value in update_dict.items():
            setattr(assignment, key, value)

        # Update rubric criteria if supplied
        if data.rubric_criteria is not None:
            # Delete existing
            self.db.query(AssignmentRubric).filter(AssignmentRubric.assignment_id == assignment_id).delete()
            for idx, item in enumerate(data.rubric_criteria):
                rubric = AssignmentRubric(
                    assignment_id=assignment_id,
                    criterion_name=item.criterion_name,
                    max_points=item.max_points,
                    description=item.description,
                    order_index=item.order_index if item.order_index is not None else idx,
                )
                self.db.add(rubric)

        self.db.commit()
        return self.get_assignment_by_id(assignment_id)

    def delete_assignment(self, assignment_id: int) -> bool:
        assignment = self.db.query(Assignment).filter(Assignment.id == assignment_id).first()
        if not assignment:
            return False
        self.db.delete(assignment)
        self.db.commit()
        return True

    def get_assignment_by_id(self, assignment_id: int) -> Optional[Assignment]:
        stmt = (
            select(Assignment)
            .options(
                selectinload(Assignment.rubric_criteria),
                selectinload(Assignment.course),
                selectinload(Assignment.lesson),
            )
            .where(Assignment.id == assignment_id)
        )
        return self.db.scalar(stmt)

    def list_teacher_assignments(
        self,
        teacher_id: int,
        status: Optional[str] = None,
        course_id: Optional[int] = None,
        assignment_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Assignment]:
        stmt = (
            select(Assignment)
            .options(
                selectinload(Assignment.course),
                selectinload(Assignment.lesson),
                selectinload(Assignment.submissions),
            )
            .where(Assignment.teacher_id == teacher_id)
        )

        if course_id:
            stmt = stmt.where(Assignment.course_id == course_id)
        if status and status.lower() != "all":
            # Support status string mapping
            status_enum = status.upper().replace("-", "_")
            if status_enum in AssignmentStatus.__members__:
                stmt = stmt.where(Assignment.status == AssignmentStatus[status_enum])
        if assignment_type and assignment_type.lower() != "all":
            type_enum = assignment_type.upper().replace("-", "_")
            if type_enum in AssignmentType.__members__:
                stmt = stmt.where(Assignment.assignment_type == AssignmentType[type_enum])
        if difficulty and difficulty.lower() != "all":
            diff_enum = difficulty.upper()
            if diff_enum in AssignmentDifficulty.__members__:
                stmt = stmt.where(Assignment.difficulty == AssignmentDifficulty[diff_enum])
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.join(Course, Assignment.course_id == Course.id).where(
                or_(
                    Assignment.title.ilike(search_pattern),
                    Course.title.ilike(search_pattern),
                )
            )

        stmt = stmt.order_by(desc(Assignment.created_at))
        return list(self.db.scalars(stmt).all())

    def list_student_assignments(
        self,
        student_id: int,
        status: Optional[str] = None,
        course_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[Tuple[Assignment, Optional[AssignmentSubmission]]]:
        # Get courses where student is enrolled
        enrolled_course_ids = [
            e.course_id
            for e in self.db.query(CourseEnrollment.course_id)
            .filter(CourseEnrollment.student_id == student_id)
            .all()
        ]

        if not enrolled_course_ids:
            enrolled_course_ids = [
                c.id for c in self.db.query(Course.id).filter(Course.is_published == True).all()
            ]

        if not enrolled_course_ids:
            enrolled_course_ids = [
                a.course_id
                for a in self.db.query(Assignment.course_id)
                .filter(Assignment.status != AssignmentStatus.DRAFT)
                .all()
            ]

        if not enrolled_course_ids:
            return []


        stmt = (
            select(Assignment, AssignmentSubmission)
            .outerjoin(
                AssignmentSubmission,
                and_(
                    AssignmentSubmission.assignment_id == Assignment.id,
                    AssignmentSubmission.student_id == student_id,
                ),
            )
            .options(
                selectinload(Assignment.course),
                selectinload(Assignment.lesson),
            )
            .where(
                Assignment.course_id.in_(enrolled_course_ids),
                Assignment.status != AssignmentStatus.DRAFT,  # Students only see published assignments
            )
        )

        if course_id:
            stmt = stmt.where(Assignment.course_id == course_id)

        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.join(Course, Assignment.course_id == Course.id).where(
                or_(
                    Assignment.title.ilike(search_pattern),
                    Course.title.ilike(search_pattern),
                )
            )

        results = self.db.execute(stmt).all()
        output = []

        now = datetime.now(timezone.utc)
        for assignment, submission in results:
            sub_status = submission.status if submission else SubmissionStatus.NOT_STARTED

            # Check filtering
            if status and status.lower() != "all":
                filter_key = status.lower()
                if filter_key == "to_do" or filter_key == "to-do":
                    if sub_status in [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED, SubmissionStatus.UNDER_REVIEW]:
                        continue
                elif filter_key == "submitted":
                    if sub_status not in [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.LATE]:
                        continue
                elif filter_key == "graded":
                    if sub_status != SubmissionStatus.GRADED:
                        continue
                elif filter_key == "overdue":
                    is_overdue = assignment.due_date and assignment.due_date < now and sub_status in [SubmissionStatus.NOT_STARTED, SubmissionStatus.DRAFT]
                    if not is_overdue:
                        continue

            output.append((assignment, submission))

        return output

    # ----------------------------------------------------
    # Stats Aggregation
    # ----------------------------------------------------
    def get_teacher_stats(self, teacher_id: int) -> Dict[str, Any]:
        assignments = self.db.query(Assignment).filter(Assignment.teacher_id == teacher_id).all()
        total_assignments = len(assignments)
        active_assignments = sum(1 for a in assignments if a.status == AssignmentStatus.ACTIVE)

        assignment_ids = [a.id for a in assignments]
        if not assignment_ids:
            return {
                "total_assignments": 0,
                "active_assignments": 0,
                "pending_review_count": 0,
                "average_submission_rate": 0.0,
                "average_score": 0.0,
            }

        submissions = self.db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id.in_(assignment_ids)
        ).all()

        pending_review_count = sum(
            1 for s in submissions if s.status in [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.LATE]
        )

        graded_scores = [s.score for s in submissions if s.score is not None]
        avg_score = (sum(graded_scores) / len(graded_scores)) if graded_scores else 0.0

        # Calculate submission rate against enrolled students
        total_enrollments = 0
        course_ids = list(set(a.course_id for a in assignments))
        if course_ids:
            total_enrollments = self.db.query(CourseEnrollment).filter(
                CourseEnrollment.course_id.in_(course_ids)
            ).count()

        submission_rate = (len(submissions) / total_enrollments * 100.0) if total_enrollments > 0 else 0.0

        return {
            "total_assignments": total_assignments,
            "active_assignments": active_assignments,
            "pending_review_count": pending_review_count,
            "average_submission_rate": round(submission_rate, 1),
            "average_score": round(avg_score, 1),
        }

    # ----------------------------------------------------
    # Submissions Management
    # ----------------------------------------------------
    def get_submission_by_id(self, submission_id: int) -> Optional[AssignmentSubmission]:
        stmt = (
            select(AssignmentSubmission)
            .options(
                selectinload(AssignmentSubmission.assignment).selectinload(Assignment.rubric_criteria),
                selectinload(AssignmentSubmission.student),
                selectinload(AssignmentSubmission.grader),
            )
            .where(AssignmentSubmission.id == submission_id)
        )
        return self.db.scalar(stmt)

    def get_student_submission(self, assignment_id: int, student_id: int) -> Optional[AssignmentSubmission]:
        stmt = (
            select(AssignmentSubmission)
            .options(
                selectinload(AssignmentSubmission.assignment).selectinload(Assignment.rubric_criteria),
                selectinload(AssignmentSubmission.student),
            )
            .where(
                AssignmentSubmission.assignment_id == assignment_id,
                AssignmentSubmission.student_id == student_id,
            )
        )
        return self.db.scalar(stmt)

    def create_or_update_submission(
        self, assignment: Assignment, student_id: int, data: SubmissionCreate
    ) -> AssignmentSubmission:
        submission = self.db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment.id,
            AssignmentSubmission.student_id == student_id,
        ).first()

        now = datetime.now(timezone.utc)
        is_late = assignment.due_date and now > assignment.due_date

        if not submission:
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student_id,
                text_response=data.text_response,
                external_url=data.external_url,
                file_ids=data.file_ids,
                status=SubmissionStatus.DRAFT if data.is_draft else (SubmissionStatus.LATE if is_late else SubmissionStatus.SUBMITTED),
                submitted_at=None if data.is_draft else now,
                is_late=bool(is_late),
            )
            self.db.add(submission)
        else:
            submission.text_response = data.text_response
            submission.external_url = data.external_url
            submission.file_ids = data.file_ids
            submission.updated_at = now
            if not data.is_draft:
                submission.status = SubmissionStatus.LATE if is_late else SubmissionStatus.SUBMITTED
                submission.submitted_at = now
                submission.is_late = bool(is_late)
            else:
                submission.status = SubmissionStatus.DRAFT

        self.db.commit()
        self.db.refresh(submission)
        res = self.get_submission_by_id(submission.id)
        if not res:
            return submission
        return res

    def list_assignment_submissions(self, assignment_id: int) -> List[AssignmentSubmission]:
        stmt = (
            select(AssignmentSubmission)
            .options(
                selectinload(AssignmentSubmission.student),
                selectinload(AssignmentSubmission.grader),
            )
            .where(AssignmentSubmission.assignment_id == assignment_id)
            .order_by(desc(AssignmentSubmission.updated_at))
        )
        return list(self.db.scalars(stmt).all())

    def grade_submission(self, submission_id: int, teacher_id: int, grade_data: SubmissionGrade) -> AssignmentSubmission:
        submission = self.get_submission_by_id(submission_id)
        if not submission:
            raise ValueError("Submission not found")

        submission.score = grade_data.score
        submission.feedback = grade_data.feedback
        submission.rubric_scores = grade_data.rubric_scores
        submission.graded_at = datetime.now(timezone.utc)
        submission.graded_by = teacher_id
        submission.status = SubmissionStatus.GRADED

        self.db.commit()
        res = self.get_submission_by_id(submission_id)
        if not res:
            return submission
        return res

    def request_resubmission(self, submission_id: int, reason: str) -> AssignmentSubmission:
        submission = self.get_submission_by_id(submission_id)
        if not submission:
            raise ValueError("Submission not found")

        submission.status = SubmissionStatus.RESUBMISSION_REQUIRED
        submission.resubmission_reason = reason

        self.db.commit()
        res = self.get_submission_by_id(submission_id)
        if not res:
            return submission
        return res

