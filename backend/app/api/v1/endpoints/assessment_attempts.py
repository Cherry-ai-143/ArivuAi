from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.assessment_attempt import (
    AssessmentAttemptCreate,
    AssessmentAttemptResponse,
)
from app.services.assessment_attempt import AssessmentAttemptService

router = APIRouter()


@router.post(
    "/",
    response_model=AssessmentAttemptResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_attempt(
    attempt: AssessmentAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssessmentAttemptService(db)

    return service.create_attempt(
        attempt,
        current_user,
    )


@router.get(
    "/me",
    response_model=list[AssessmentAttemptResponse],
)
def get_my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssessmentAttemptService(db)

    return service.get_my_attempts(
        current_user,
    )


@router.get(
    "/assessment/{assessment_id}",
    response_model=list[AssessmentAttemptResponse],
)
def get_assessment_attempts(
    assessment_id: int,
    db: Session = Depends(get_db),
):
    service = AssessmentAttemptService(db)

    return service.get_assessment_attempts(
        assessment_id,
    )


@router.get(
    "/{attempt_id}",
    response_model=AssessmentAttemptResponse,
)
def get_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
):
    service = AssessmentAttemptService(db)

    return service.get_attempt_by_id(
        attempt_id,
    )


@router.put(
    "/{attempt_id}/submit",
    response_model=AssessmentAttemptResponse,
)
def submit_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssessmentAttemptService(db)

    return service.submit_attempt(
        attempt_id,
        current_user,
    )


@router.delete(
    "/{attempt_id}",
)
def delete_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssessmentAttemptService(db)

    return service.delete_attempt(
        attempt_id,
        current_user,
    )