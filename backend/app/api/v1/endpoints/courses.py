from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.course import Course
from app.schemas.course import (
    CourseCreate,
    CourseResponse,
    CourseUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.services.course import CourseService

router = APIRouter()


# Search Courses
@router.get(
    "/search",
    response_model=PaginatedResponse[CourseResponse],
    summary="Search courses with filters (level, teacher, status, search)",
)
def search_courses(
    q: str | None = Query(None, description="Search term for title/description"),
    level: str | None = Query(None),
    teacher_id: int | None = Query(None),
    my_courses: bool | None = Query(None),
    is_published: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort: str | None = Query(None),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    query = select(Course)

    role_name = ""
    if current_user and hasattr(current_user, "role") and current_user.role:
        role_name = getattr(current_user.role, "name", str(current_user.role)).upper()

    if teacher_id:
        query = query.where(Course.teacher_id == teacher_id)
    elif my_courses is True and current_user:
        query = query.where(Course.teacher_id == current_user.id)
    elif role_name in ["TEACHER", "TEACHER_ROLE"] and current_user and is_published is not True:
        query = query.where(Course.teacher_id == current_user.id)

    if level:
        query = query.where(Course.level == level)
    if is_published is not None:
        query = query.where(Course.is_published == is_published)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.where(or_(Course.title.ilike(term), Course.description.ilike(term)))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar() or 0

    # Sort
    if sort == "title":
        query = query.order_by(Course.title.desc() if order == "desc" else Course.title.asc())
    elif sort == "created_at":
        query = query.order_by(Course.created_at.desc() if order == "desc" else Course.created_at.asc())
    else:
        query = query.order_by(Course.id.desc() if order == "desc" else Course.id.asc())

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    items = db.execute(query).scalars().all()
    pages = (total + page_size - 1) // page_size if page_size > 0 else 0

    return PaginatedResponse[CourseResponse](
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# Create Course
@router.post(
    "/",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CourseService(db)
    return service.create_course(course_data, current_user)


# Get All Courses (supports optional level, teacher, search filters)
@router.get(
    "/",
    response_model=list[CourseResponse],
)
def get_all_courses(
    level: str | None = Query(None),
    teacher_id: int | None = Query(None),
    my_courses: bool | None = Query(None),
    is_published: bool | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    query = select(Course)

    role_name = ""
    if current_user and hasattr(current_user, "role") and current_user.role:
        role_name = getattr(current_user.role, "name", str(current_user.role)).upper()

    if teacher_id:
        query = query.where(Course.teacher_id == teacher_id)
    elif my_courses is True and current_user:
        query = query.where(Course.teacher_id == current_user.id)
    elif role_name in ["TEACHER", "TEACHER_ROLE"] and current_user and is_published is not True:
        query = query.where(Course.teacher_id == current_user.id)

    if level:
        query = query.where(Course.level == level)
    if is_published is not None:
        query = query.where(Course.is_published == is_published)
    return list(db.execute(query).scalars().all())


# Get Course By ID
@router.get(
    "/{course_id}",
    response_model=CourseResponse,
)
def get_course_by_id(
    course_id: int,
    db: Session = Depends(get_db),
):
    service = CourseService(db)
    return service.get_course_by_id(course_id)


# Update Course
@router.put(
    "/{course_id}",
    response_model=CourseResponse,
)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CourseService(db)
    return service.update_course(course_id, course_data, current_user)


# Delete Course
@router.delete(
    "/{course_id}",
)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CourseService(db)
    return service.delete_course(course_id, current_user)