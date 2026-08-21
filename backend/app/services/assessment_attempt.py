# Date & Time
from datetime import datetime, timezone

# FastAPI
from fastapi import HTTPException, status

# SQLAlchemy
from sqlalchemy.orm import Session

# Models
from app.models.user import User
from app.models.assessment_attempt import AssessmentAttempt, AttemptStatus
from app.models.assessment import Assessment
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.student_answer import StudentAnswer
from app.enums.assessment import AssessmentStatus as AssessmentStatusEnum

# Repositories
from app.repositories.assessment import AssessmentRepository
from app.repositories.assessment_attempt import AssessmentAttemptRepository
from app.repositories.student_answer import StudentAnswerRepository
from app.repositories.question import QuestionRepository

# Schemas
from app.schemas.assessment_attempt import (
    AssessmentAttemptCreate,
    AssessmentAttemptUpdate,
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
)


class AssessmentAttemptService:

    # Constructor
    def __init__(self, db: Session):
        self.db = db

        # Assessment Attempt Repository
        self.repository = AssessmentAttemptRepository(db)

        # Assessment Repository
        self.assessment_repository = AssessmentRepository(db)

        # Student Answer Repository
        self.student_answer_repository = StudentAnswerRepository(db)

        # Question Repository
        self.question_repository = QuestionRepository(db)

    # Create / Resume Assessment Attempt
    def create_attempt(
        self,
        attempt_data: AssessmentAttemptCreate,
        current_user: User,
    ):
        user_role = str(current_user.role.value if hasattr(current_user.role, "value") else current_user.role).lower()
        if user_role not in ["student", "admin", "teacher"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can start assessments",
            )

        assessment = self.assessment_repository.get_assessment_by_id(
            attempt_data.assessment_id
        )

        if not assessment or assessment.status != AssessmentStatusEnum.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Published assessment not found",
            )

        # Verify Course Enrollment
        enrollment = (
            self.db.query(CourseEnrollment)
            .filter(
                CourseEnrollment.student_id == current_user.id,
                CourseEnrollment.course_id == assessment.course_id,
            )
            .first()
        )
        if not enrollment and user_role == "student":
            # Auto-enroll student into published course
            enrollment = CourseEnrollment(
                student_id=current_user.id,
                course_id=assessment.course_id,
                status=EnrollmentStatus.ENROLLED,
            )
            self.db.add(enrollment)
            self.db.commit()
            self.db.refresh(enrollment)


        # Check for existing IN_PROGRESS attempt (Resume logic)
        existing_in_progress = (
            self.db.query(AssessmentAttempt)
            .filter(
                AssessmentAttempt.assessment_id == assessment.id,
                AssessmentAttempt.student_id == current_user.id,
                AssessmentAttempt.status == AttemptStatus.IN_PROGRESS,
            )
            .first()
        )
        if existing_in_progress:
            return existing_in_progress

        # Check attempt limit against max_attempts
        submitted_count = (
            self.db.query(AssessmentAttempt)
            .filter(
                AssessmentAttempt.assessment_id == assessment.id,
                AssessmentAttempt.student_id == current_user.id,
                AssessmentAttempt.status == AttemptStatus.SUBMITTED,
            )
            .count()
        )
        if submitted_count >= assessment.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum attempt limit ({assessment.max_attempts}) reached for this assessment",
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

    # Submit Assessment Attempt with Atomic Answers Payload & Grading
    def submit_attempt_with_answers(
        self,
        attempt_id: int,
        payload: AssessmentSubmitRequest,
        current_user: User,
    ) -> AssessmentSubmitResponse:
        attempt = self.get_attempt_by_id(attempt_id)

        if attempt.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to submit this attempt",
            )

        if attempt.status == AttemptStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment attempt already submitted",
            )

        assessment = self.assessment_repository.get_assessment_by_id(attempt.assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated assessment not found",
            )

        # Server-side Duration Expiration Enforcement Check
        if assessment.duration_minutes and assessment.duration_minutes > 0:
            now_utc = datetime.now(timezone.utc)
            started_at = attempt.started_at
            if started_at is not None:
                if started_at.tzinfo is None:
                    started_at = started_at.replace(tzinfo=timezone.utc)
                elapsed_seconds = (now_utc - started_at).total_seconds()
                max_allowed_seconds = (assessment.duration_minutes * 60) + 60  # 60s network/client grace period
                if elapsed_seconds > max_allowed_seconds:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Assessment duration ({assessment.duration_minutes} minutes) exceeded. Submission expired.",
                    )

        # Build lookup of valid assessment questions
        aqs = assessment.assessment_questions or []
        valid_aq_map = {aq.question_id: aq for aq in aqs}

        # Security Check: Verify that all submitted question IDs belong to this assessment
        for ans in payload.answers:
            if ans.question_id not in valid_aq_map:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question ID {ans.question_id} does not belong to this assessment",
                )

        total_score = 0
        correct_count = 0
        incorrect_count = 0

        # Grade each answer transactionally
        for ans in payload.answers:
            question = self.question_repository.get_question_by_id(ans.question_id)
            if not question:
                continue

            # Compare selected option with correct_option (case-insensitive)
            selected = (ans.selected_option or "").strip().lower()
            correct = (question.correct_option or "").strip().lower()
            is_correct = bool(selected and correct and selected == correct)

            aq_entry = valid_aq_map.get(ans.question_id)
            marks_assigned = aq_entry.marks if (aq_entry and aq_entry.marks) else (question.marks or 1)
            marks_obtained = marks_assigned if is_correct else 0

            if is_correct:
                correct_count += 1
                total_score += marks_obtained
            else:
                incorrect_count += 1

            # Check if answer entry already exists
            existing_ans = (
                self.db.query(StudentAnswer)
                .filter(
                    StudentAnswer.attempt_id == attempt.id,
                    StudentAnswer.question_id == ans.question_id,
                )
                .first()
            )
            if existing_ans:
                existing_ans.selected_option = ans.selected_option
                existing_ans.is_correct = is_correct
                existing_ans.marks_obtained = marks_obtained
            else:
                new_ans = StudentAnswer(
                    attempt_id=attempt.id,
                    question_id=ans.question_id,
                    selected_option=ans.selected_option,
                    is_correct=is_correct,
                    marks_obtained=marks_obtained,
                )
                self.db.add(new_ans)

        # Count questions not answered in submission as incorrect
        unanswered_count = max(0, len(aqs) - len(payload.answers))
        incorrect_count += unanswered_count

        total_marks = assessment.total_marks
        if total_marks <= 0:
            total_marks = len(aqs)

        percentage = round((total_score / total_marks * 100.0), 2) if total_marks > 0 else 0.0
        passed = percentage >= assessment.passing_score

        # Update attempt fields
        now = datetime.now(timezone.utc)
        attempt.score = total_score
        attempt.status = AttemptStatus.SUBMITTED
        attempt.submitted_at = now

        self.db.commit()
        self.db.refresh(attempt)

        return AssessmentSubmitResponse(
            attempt_id=attempt.id,
            assessment_id=assessment.id,
            status=attempt.status,
            score=total_score,
            total_marks=total_marks,
            percentage=percentage,
            passed=passed,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            total_questions=len(aqs),
            submitted_at=now,
        )

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