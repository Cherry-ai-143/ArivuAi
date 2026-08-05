from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.progress import (
    LessonProgressResponse,
    LessonProgressUpdate,
    CourseProgressResponse,
    ContinueLearningResponse,
)
from app.services.progress_service import ProgressService

router = APIRouter()


@router.get("/lesson/{lesson_id}", response_model=LessonProgressResponse, summary="Get progress for a lesson")
def get_lesson_progress(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    return service.get_lesson_progress(current_user.id, lesson_id)


@router.put("/lesson/{lesson_id}", response_model=LessonProgressResponse, summary="Update progress for a lesson")
def update_lesson_progress(
    lesson_id: int,
    update_data: LessonProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    return service.update_lesson_progress(current_user.id, lesson_id, update_data)


@router.get("/course/{course_id}", response_model=CourseProgressResponse, summary="Get progress for a course")
def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    return service.get_course_progress(current_user.id, course_id)


@router.get("/continue", response_model=Optional[ContinueLearningResponse], summary="Get next lesson to continue learning")
def get_continue_learning(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    return service.get_continue_learning(current_user.id)
