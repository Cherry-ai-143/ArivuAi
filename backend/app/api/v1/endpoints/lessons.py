from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lesson import Lesson
from app.models.content import Content
from app.models.chapter import Chapter
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.schemas.content import ContentResponse
from app.schemas.lesson_resource import (
    LessonResourceResponse,
    LessonResourceGroupedResponse,
    LessonResourceUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.schemas.quiz_generation import QuizGenerationRequest
from app.services.lesson import LessonService
from app.services.lesson_resource import LessonResourceService
from app.services.assessment_generation_service import AssessmentGenerationService

router = APIRouter()


# ==========================================
# Search Lessons
# ==========================================
@router.get(
    "/search",
    response_model=PaginatedResponse[LessonResponse],
    summary="Search lessons with filters and pagination",
)
def search_lessons(
    q: str | None = Query(None, description="Search term for title/description"),
    chapter_id: int | None = Query(None),
    course_id: int | None = Query(None),
    is_published: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort: str | None = Query(None),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = select(Lesson)

    if chapter_id:
        query = query.where(Lesson.chapter_id == chapter_id)
    if course_id:
        query = query.join(Chapter, Lesson.chapter_id == Chapter.id).where(Chapter.course_id == course_id)
    if is_published is not None:
        query = query.where(Lesson.is_published == is_published)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.where(or_(Lesson.title.ilike(term), Lesson.description.ilike(term)))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar() or 0

    # Sort
    if sort == "title":
        query = query.order_by(Lesson.title.desc() if order == "desc" else Lesson.title.asc())
    elif sort == "created_at":
        query = query.order_by(Lesson.created_at.desc() if order == "desc" else Lesson.created_at.asc())
    else:
        query = query.order_by(Lesson.order_number.desc() if order == "desc" else Lesson.order_number.asc())

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    items = db.execute(query).scalars().all()
    pages = (total + page_size - 1) // page_size if page_size > 0 else 0

    return PaginatedResponse[LessonResponse](
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# ==========================================
# Create Lesson
# ==========================================
@router.post(
    "/",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lesson(
    lesson_data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = LessonService(db)
    return service.create_lesson(lesson_data, current_user)


# ==========================================
# Get All Lessons (with pagination & filters)
# ==========================================
@router.get(
    "/",
    response_model=list[LessonResponse],
)
def get_all_lessons(
    chapter_id: int | None = Query(None),
    course_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    if chapter_id or course_id:
        query = select(Lesson)
        if chapter_id:
            query = query.where(Lesson.chapter_id == chapter_id)
        if course_id:
            query = query.join(Chapter, Lesson.chapter_id == Chapter.id).where(Chapter.course_id == course_id)
        return list(db.execute(query).scalars().all())

    service = LessonService(db)
    return service.get_all_lessons()


# ==========================================
# Get Lesson By ID
# ==========================================
@router.get(
    "/{lesson_id}",
    response_model=LessonResponse,
)
def get_lesson_by_id(
    lesson_id: int,
    db: Session = Depends(get_db),
):
    service = LessonService(db)
    return service.get_lesson_by_id(lesson_id)


# ==========================================
# PART 3 — Get Lesson Contents
# ==========================================
@router.get(
    "/{lesson_id}/contents",
    response_model=list[ContentResponse],
    summary="Get contents belonging to a specific lesson ordered by display order",
)
def get_lesson_contents(
    lesson_id: int,
    db: Session = Depends(get_db),
):
    query = (
        select(Content)
        .where(Content.lesson_id == lesson_id)
        .order_by(Content.order_number.asc())
    )
    contents = db.execute(query).scalars().all()
    return list(contents)


# ==========================================
# PART 4 — Get Lesson Resources (Grouped)
# ==========================================
@router.get(
    "/{lesson_id}/resources",
    response_model=LessonResourceGroupedResponse,
    summary="Get categorized lesson resources (PDFs, Videos, YouTube, GitHub, PPT, Books, Notes, Links)",
)
def get_lesson_resources(
    lesson_id: int,
    db: Session = Depends(get_db),
):
    service = LessonResourceService(db)
    return service.get_grouped_resources(lesson_id)


# ==========================================
# PART 4 — Upload / Create Lesson Resource
# ==========================================
@router.post(
    "/{lesson_id}/resources",
    response_model=LessonResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload or attach a study resource to a lesson",
)
def upload_lesson_resource(
    lesson_id: int,
    title: str = Form(...),
    resource_type: str = Form(...),
    file: UploadFile | None = File(None),
    url: str | None = Form(None),
    author: str | None = Form(None),
    description: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = LessonResourceService(db)
    return service.upload_resource(
        lesson_id=lesson_id,
        title=title,
        resource_type=resource_type,
        file=file,
        url=url,
        author=author,
        description=description,
    )


# ==========================================
# PART 4 — Update Lesson Resource
# ==========================================
@router.put(
    "/{lesson_id}/resources/{resource_id}",
    response_model=LessonResourceResponse,
    summary="Update a lesson resource",
)
def update_lesson_resource(
    lesson_id: int,
    resource_id: int,
    update_data: LessonResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = LessonResourceService(db)
    return service.update_resource(lesson_id, resource_id, update_data)


# ==========================================
# PART 4 — Delete Lesson Resource
# ==========================================
@router.delete(
    "/{lesson_id}/resources/{resource_id}",
    summary="Delete a lesson resource",
)
def delete_lesson_resource(
    lesson_id: int,
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = LessonResourceService(db)
    return service.delete_resource(lesson_id, resource_id)


# ==========================================
# PART 4 — Download Lesson Resource
# ==========================================
@router.get(
    "/{lesson_id}/resources/{resource_id}/download",
    summary="Download a lesson resource file",
)
def download_lesson_resource(
    lesson_id: int,
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = LessonResourceService(db)
    file_path = service.get_resource_file_path(lesson_id, resource_id)
    return FileResponse(file_path, filename=file_path.split("/")[-1])


# ==========================================
# Update Lesson
# ==========================================
@router.put(
    "/{lesson_id}",
    response_model=LessonResponse,
)
def update_lesson(
    lesson_id: int,
    lesson_data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = LessonService(db)
    return service.update_lesson(lesson_id, lesson_data, current_user)


# ==========================================
# Delete Lesson
# ==========================================
@router.delete(
    "/{lesson_id}",
)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = LessonService(db)
    return service.delete_lesson(lesson_id, current_user)


# ==========================================
# Generate AI Quiz
# ==========================================
@router.post(
    "/{lesson_id}/generate-quiz",
)
def generate_quiz(
    lesson_id: int,
    request: QuizGenerationRequest,
    db: Session = Depends(get_db),
):
    service = AssessmentGenerationService(db)
    return service.generate_quiz(
        lesson_id=lesson_id,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
    )