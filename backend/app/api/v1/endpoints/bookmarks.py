from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.bookmark import BookmarkResponse
from app.services.bookmark_service import BookmarkService

router = APIRouter()


@router.get("/me", response_model=List[BookmarkResponse], summary="Get my bookmarked lessons")
def get_my_bookmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = BookmarkService(db)
    return service.get_student_bookmarks(current_user.id)


@router.post("/lesson/{lesson_id}", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED, summary="Bookmark a lesson")
def add_bookmark(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = BookmarkService(db)
    return service.add_bookmark(current_user.id, lesson_id)


@router.delete("/lesson/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove bookmark")
def remove_bookmark(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = BookmarkService(db)
    service.remove_bookmark(current_user.id, lesson_id)
