from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.result import AssessmentResultResponse
from app.services.result import ResultService

router = APIRouter()


@router.get(
    "/{attempt_id}",
    response_model=AssessmentResultResponse,
)
def get_result(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResultService(db)

    return service.get_result(
        attempt_id,
        current_user,
    )