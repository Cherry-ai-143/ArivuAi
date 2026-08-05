from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, get_current_user, get_optional_current_user
from app.models.user import User
from app.models.question import Question, QuestionType
from app.models.lesson import Lesson
from app.models.chapter import Chapter
from app.models.course import Course
from app.models.assessment import Assessment
from app.schemas.question import (
    QuestionCreate,
    QuestionResponse,
    QuestionUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.services.question import QuestionService

router = APIRouter()


@router.get(
    "/search",
    response_model=PaginatedResponse[QuestionResponse],
    summary="Search questions with progressive hierarchical filters and teacher isolation",
)
def search_questions(
    q: str | None = Query(None, description="Search term in question text"),
    course_id: int | None = Query(None),
    chapter_id: int | None = Query(None),
    lesson_id: int | None = Query(None),
    assessment_id: int | None = Query(None),
    source: str | None = Query(None),
    question_type: str | None = Query(None, alias="type"),
    difficulty: str | None = Query(None),
    bloom_level: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    query = (
        select(Question)
        .options(joinedload(Question.lesson))
        .join(Lesson, Question.lesson_id == Lesson.id)
        .join(Chapter, Lesson.chapter_id == Chapter.id)
        .join(Course, Chapter.course_id == Course.id)
    )

    if current_user is not None:
        query = query.where(Course.teacher_id == current_user.id)

    if lesson_id is not None:
        query = query.where(Question.lesson_id == lesson_id)
    elif chapter_id is not None:
        query = query.where(Lesson.chapter_id == chapter_id)
    elif course_id is not None:
        query = query.where(Chapter.course_id == course_id)
    elif assessment_id is not None:
        query = query.where(Question.assessment_id == assessment_id)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.where(Question.question_text.ilike(term))

    if source and isinstance(source, str) and source != "All":
        if source == "Manual":
            query = query.where(or_(Question.is_ai_generated == False, Question.is_ai_generated.is_(None)))
        elif source in ["AI", "AI Generated"]:
            query = query.where(Question.is_ai_generated == True)

    if question_type and isinstance(question_type, str) and question_type != "All":
        # Map common frontend labels to the QuestionType enum values
        type_map = {
            "Multiple Choice": QuestionType.MULTIPLE_CHOICE,
            "MULTIPLE_CHOICE": QuestionType.MULTIPLE_CHOICE,
            "MCQ": QuestionType.MULTIPLE_CHOICE,
            "True/False": QuestionType.TRUE_FALSE,
            "TRUE_FALSE": QuestionType.TRUE_FALSE,
            "Fill in the Blanks": QuestionType.FILL_BLANK,
            "FILL_BLANK": QuestionType.FILL_BLANK,
            "Short Answer": QuestionType.SHORT_ANSWER,
            "SHORT_ANSWER": QuestionType.SHORT_ANSWER,
            "Matching": QuestionType.MATCHING,
            "MATCHING": QuestionType.MATCHING,
            "Ordering": QuestionType.ORDERING,
            "ORDERING": QuestionType.ORDERING,
            "Mixed": QuestionType.MIXED,
            "MIXED": QuestionType.MIXED,
        }
        mapped_type = type_map.get(question_type, question_type)
        query = query.where(Question.question_type == mapped_type)

    if difficulty and isinstance(difficulty, str) and difficulty != "All":
        query = query.where(Question.difficulty.ilike(f"%{difficulty}%"))

    if bloom_level and isinstance(bloom_level, str) and bloom_level != "All":
        query = query.where(Question.bloom_level.ilike(f"%{bloom_level}%"))

    query = query.distinct()

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(Question.id.asc()).offset(offset).limit(page_size)

    items = db.execute(query).scalars().all()
    for item in items:
        if hasattr(item, "lesson") and item.lesson:
            item.lesson_title = item.lesson.title

    pages = (total + page_size - 1) // page_size if page_size > 0 else 0

    return PaginatedResponse[QuestionResponse](
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post(
    "/",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    service = QuestionService(db)
    return service.create_question(question, current_user)


@router.get(
    "/",
    response_model=list[QuestionResponse],
)
def get_all_questions(
    assessment_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    if assessment_id:
        query = select(Question).where(Question.assessment_id == assessment_id)
        return list(db.execute(query).scalars().all())

    service = QuestionService(db)
    return service.get_all_questions()


@router.get(
    "/{question_id}",
    response_model=QuestionResponse,
)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    service = QuestionService(db)
    return service.get_question_by_id(question_id)


@router.get(
    "/assessment/{assessment_id}",
    response_model=list[QuestionResponse],
)
def get_questions_by_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
):
    service = QuestionService(db)
    return service.get_questions_by_assessment(assessment_id)


@router.put(
    "/{question_id}",
    response_model=QuestionResponse,
)
def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    service = QuestionService(db)
    return service.update_question(question_id, question_data, current_user)


@router.delete(
    "/{question_id}",
)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    service = QuestionService(db)
    return service.delete_question(question_id, current_user)