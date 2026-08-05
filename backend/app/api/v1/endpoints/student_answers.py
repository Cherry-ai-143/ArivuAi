from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.student_answer import (
    StudentAnswerCreate,
    StudentAnswerResponse,
    StudentAnswerUpdate,
)
from app.services.student_answer import StudentAnswerService

router = APIRouter()


@router.post(
    "/",
    response_model=StudentAnswerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_answer(
    answer: StudentAnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StudentAnswerService(db)
    return service.create_answer(
        answer,
        current_user,
    )


@router.get(
    "/attempt/{attempt_id}",
    response_model=list[StudentAnswerResponse],
)
def get_attempt_answers(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StudentAnswerService(db)
    return service.get_attempt_answers(
        attempt_id,
        current_user,
    )


@router.get(
    "/{answer_id}",
    response_model=StudentAnswerResponse,
)
def get_answer(
    answer_id: int,
    db: Session = Depends(get_db),
):
    service = StudentAnswerService(db)
    return service.get_answer_by_id(
        answer_id
    )


@router.put(
    "/{answer_id}",
    response_model=StudentAnswerResponse,
)
def update_answer(
    answer_id: int,
    answer_data: StudentAnswerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StudentAnswerService(db)
    return service.update_answer(
        answer_id,
        answer_data,
        current_user,
    )


@router.delete(
    "/{answer_id}",
)
def delete_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = StudentAnswerService(db)
    return service.delete_answer(
        answer_id,
        current_user,
    )