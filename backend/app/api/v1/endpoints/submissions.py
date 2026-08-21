from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.role_checker import RoleChecker
from app.models.user import User
from app.schemas.assignment import (
    AIGradingAnalysisResponse,
    SubmissionDetailResponse,
    SubmissionGrade,
    SubmissionRequestResubmission,
)
from app.services.assignment_ai_service import AssignmentAIService
from app.services.assignment_service import AssignmentService

router = APIRouter()
allow_teacher = RoleChecker(["teacher", "admin", "TEACHER", "ADMIN"])



@router.get(
    "/{submission_id}",
    response_model=SubmissionDetailResponse,
    summary="Get single submission detail (Teacher or Student owner)",
)
def get_submission_detail(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssignmentService(db)
    return service.get_submission_detail(submission_id, current_user)


@router.post(
    "/{submission_id}/grade",
    response_model=SubmissionDetailResponse,
    summary="Grade a student submission and publish score/feedback (Teacher)",
)
def grade_submission(
    submission_id: int,
    grade_data: SubmissionGrade,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.grade_submission(submission_id, current_user, grade_data)


@router.post(
    "/{submission_id}/analyze-ai",
    response_model=AIGradingAnalysisResponse,
    summary="Analyze student submission against rubric using Gemini AI (Teacher)",
)
def analyze_submission_with_ai(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    submission = service.repo.get_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    user_role = str(
        current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    ).lower()
    if submission.assignment.teacher_id != current_user.id and user_role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assignment")


    ai_service = AssignmentAIService(db)
    return ai_service.analyze_submission(submission)


@router.post(
    "/{submission_id}/request-resubmission",
    response_model=SubmissionDetailResponse,
    summary="Request resubmission with reason (Teacher)",
)
def request_resubmission(
    submission_id: int,
    req: SubmissionRequestResubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.request_resubmission(submission_id, current_user, req.reason)
