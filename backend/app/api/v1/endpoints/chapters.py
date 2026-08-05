from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.chapter import (
    ChapterCreate,
    ChapterUpdate,
    ChapterResponse,
)
from app.schemas.lesson import LessonResponse
from app.schemas.pagination import PaginatedResponse
from app.services.chapter import ChapterService
from app.models.lesson import Lesson
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


# Create Chapter
@router.post(
    "/",
    response_model=ChapterResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_chapter(
    chapter: ChapterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)

    try:
        return service.create_chapter(
            chapter,
            current_user,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )


# Get All Chapters
@router.get(
    "/",
    response_model=list[ChapterResponse],
)
def get_all_chapters(
    db: Session = Depends(get_db),
):
    service = ChapterService(db)
    return service.get_all_chapters()


# Get Chapter By ID
@router.get(
    "/{chapter_id}",
    response_model=ChapterResponse,
)
def get_chapter_by_id(
    chapter_id: int,
    db: Session = Depends(get_db),
):
    service = ChapterService(db)

    try:
        return service.get_chapter_by_id(
            chapter_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# Get Chapters By Course
@router.get(
    "/course/{course_id}",
    response_model=list[ChapterResponse],
)
def get_chapters_by_course(
    course_id: int,
    db: Session = Depends(get_db),
):
    service = ChapterService(db)
    return service.get_chapters_by_course(
        course_id,
    )


# PART 2 — Get Lessons belonging to a Chapter with Pagination & Search
@router.get(
    "/{chapter_id}/lessons",
    response_model=PaginatedResponse[LessonResponse],
    summary="Get lessons for a specific chapter with pagination & search",
)
def get_lessons_by_chapter(
    chapter_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    sort: str | None = Query(None),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = select(Lesson).where(Lesson.chapter_id == chapter_id)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(or_(Lesson.title.ilike(term), Lesson.description.ilike(term)))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar() or 0

    # Sorting
    if sort == "title":
        query = query.order_by(Lesson.title.desc() if order == "desc" else Lesson.title.asc())
    elif sort == "created_at":
        query = query.order_by(Lesson.created_at.desc() if order == "desc" else Lesson.created_at.asc())
    else:
        query = query.order_by(Lesson.order_number.desc() if order == "desc" else Lesson.order_number.asc())

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    lessons = db.execute(query).scalars().all()
    pages = (total + page_size - 1) // page_size if page_size > 0 else 0

    return PaginatedResponse[LessonResponse](
        items=list(lessons),
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# Update Chapter
@router.put(
    "/{chapter_id}",
    response_model=ChapterResponse,
)
def update_chapter(
    chapter_id: int,
    chapter: ChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)

    try:
        return service.update_chapter(
            chapter_id,
            chapter,
            current_user,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )


# Delete Chapter
@router.delete(
    "/{chapter_id}",
)
def delete_chapter(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)

    try:
        return service.delete_chapter(
            chapter_id,
            current_user,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )