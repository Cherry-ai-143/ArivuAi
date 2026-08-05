from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.search import GlobalSearchResponse
from app.repositories.search import SearchRepository

router = APIRouter()


@router.get(
    "/",
    response_model=GlobalSearchResponse,
    summary="Global search across Courses, Lessons, Chapters, Assessments, Questions, and Contents",
)
def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    type: str = Query("all", description="Entity filter: all, course, lesson, chapter, assessment, question, content"),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = SearchRepository(db)
    return repo.global_search(q=q, search_type=type, limit=page_size)
