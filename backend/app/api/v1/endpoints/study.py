from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.study_session import (
    StudySessionStartRequest,
    StudySessionResponse,
    StudySessionEndResponse,
)
from app.services.study_service import StudyService

router = APIRouter()


@router.post("/start", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED, summary="Start a study session")
def start_study_session(
    req: StudySessionStartRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = StudyService(db)
    client_ip = request.client.host if request.client else None
    return service.start_study_session(current_user.id, req, client_ip=client_ip)


@router.put("/end/{session_id}", response_model=StudySessionEndResponse, summary="Finish a study session")
def end_study_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = StudyService(db)
    return service.end_study_session(current_user.id, session_id)
