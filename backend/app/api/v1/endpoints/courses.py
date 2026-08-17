# purpose : Define course API endpoints for creating, reading, searching, updating, and deleting courses.

import re

from fastapi import APIRouter, Depends, Query, status, HTTPException
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


# ------------------------------------------------------------------
# Search Courses
# ------------------------------------------------------------------

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
    # purpose : Start building the course query.
    query = select(Course)

    role_name = ""

    if current_user and hasattr(current_user, "role") and current_user.role:
        role_name = getattr(
            current_user.role,
            "name",
            str(current_user.role),
        ).upper()

    # purpose : Temporarily log authentication and filtering values for debugging.
    print(
        "COURSE DEBUG:",
        {
            "current_user_id": current_user.id if current_user else None,
            "current_user_email": current_user.email if current_user else None,
            "current_user_role": str(current_user.role) if current_user else None,
            "role_name": role_name,
            "my_courses": my_courses,
            "teacher_id": teacher_id,
            "is_published": is_published,
            "level": level,
            "search": q,
        },
    )

    # purpose : Restrict "My Courses" to courses created by the authenticated teacher.
    if my_courses is True:

        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to view your courses",
            )

        query = query.where(
            Course.teacher_id == current_user.id
        )

    # purpose : Allow filtering courses by a specific teacher.
    elif teacher_id is not None:

        query = query.where(
            Course.teacher_id == teacher_id
        )

    # purpose : Automatically restrict teacher users to their own courses.
    elif role_name in ["TEACHER", "TEACHER_ROLE"] and current_user:

        query = query.where(
            Course.teacher_id == current_user.id
        )

    # purpose : Filter courses by academic target profile for students.
    elif role_name in ["STUDENT", "STUDENT_ROLE"] and current_user:

        if current_user.education_level:
            std_edu = current_user.education_level
            alt_edu = std_edu.replace("–", "-") if "–" in std_edu else std_edu.replace("-", "–")

            allowed_targets = {std_edu, alt_edu}

            if any(k in std_edu.lower() for k in ["puc", "11th", "12th", "higher secondary"]):
                allowed_targets.update([
                    "PUC / 11th–12th",
                    "PUC / 11th-12th",
                    "Higher Secondary / PUC",
                ])
            elif any(k in std_edu.lower() for k in ["school", "class 7", "class 10"]):
                allowed_targets.update([
                    "Higher School (Class 7–10)",
                    "Higher School (Class 7-10)",
                    "School (Class 7–10)",
                    "School (Class 7-10)",
                ])

            query = query.where(Course.target_education_level.in_(list(allowed_targets)))

    # purpose : Filter courses by course level.
    if level:
        query = query.where(
            Course.level == level
        )

    # purpose : Filter courses by published or draft status.
    if is_published is not None:
        query = query.where(
            Course.is_published == is_published
        )

    # purpose : Search courses by title or description.
    if q and q.strip():

        term = f"%{q.strip()}%"

        query = query.where(
            or_(
                Course.title.ilike(term),
                Course.description.ilike(term),
            )
        )

    # ------------------------------------------------------------------
    # Count
    # ------------------------------------------------------------------

    # purpose : Count the courses after applying all filters.
    count_query = select(func.count()).select_from(
        query.subquery()
    )

    total = db.execute(count_query).scalar() or 0

    # ------------------------------------------------------------------
    # Sorting
    # ------------------------------------------------------------------

    # purpose : Apply requested sorting to the course results.
    if sort == "title":

        query = query.order_by(
            Course.title.desc()
            if order == "desc"
            else Course.title.asc()
        )

    elif sort == "created_at":

        query = query.order_by(
            Course.created_at.desc()
            if order == "desc"
            else Course.created_at.asc()
        )

    else:

        query = query.order_by(
            Course.id.desc()
            if order == "desc"
            else Course.id.asc()
        )

    # ------------------------------------------------------------------
    # Pagination
    # ------------------------------------------------------------------

    # purpose : Apply pagination to the filtered course query.
    offset = (page - 1) * page_size

    query = query.offset(offset).limit(page_size)

    items = db.execute(query).scalars().all()

    pages = (
        (total + page_size - 1) // page_size
        if page_size > 0
        else 0
    )

    # purpose : Log the final course IDs returned by the database for debugging.
    print(
        "COURSE RESULT DEBUG:",
        {
            "current_user_id": current_user.id if current_user else None,
            "my_courses": my_courses,
            "total": total,
            "course_ids": [course.id for course in items],
            "teacher_ids": [course.teacher_id for course in items],
        },
    )

    return PaginatedResponse[CourseResponse](
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# ------------------------------------------------------------------
# Create Course
# ------------------------------------------------------------------

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
    # purpose : Create a new course for the authenticated teacher.
    print(
        "COURSE CREATE DEBUG:",
        {
            "teacher_id": current_user.id,
            "teacher_education_level": current_user.education_level or current_user.institution_type,
            "course_title": course_data.title,
            "target_education_level": course_data.target_education_level,
            "target_course": course_data.target_course,
            "target_branch": course_data.target_branch,
            "target_year_semester": course_data.target_year_semester,
        },
    )
    service = CourseService(db)

    return service.create_course(
        course_data,
        current_user,
    )


# ------------------------------------------------------------------
# Get All Courses
# ------------------------------------------------------------------

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
    # purpose : Start building the course query.
    query = select(Course)

    role_name = ""

    if current_user and hasattr(current_user, "role") and current_user.role:
        role_name = getattr(
            current_user.role,
            "name",
            str(current_user.role),
        ).upper()

    # purpose : Restrict "My Courses" to courses created by the authenticated teacher.
    if my_courses is True:

        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to view your courses",
            )

        query = query.where(
            Course.teacher_id == current_user.id
        )

    # purpose : Allow filtering courses by a specific teacher.
    elif teacher_id is not None:

        query = query.where(
            Course.teacher_id == teacher_id
        )

    # purpose : Automatically restrict teacher users to their own courses.
    elif role_name in ["TEACHER", "TEACHER_ROLE"] and current_user:

        query = query.where(
            Course.teacher_id == current_user.id
        )

    # purpose : Filter courses by academic target profile for students.
    elif role_name in ["STUDENT", "STUDENT_ROLE"] and current_user:

        if current_user.education_level:
            std_edu = current_user.education_level
            alt_edu = std_edu.replace("–", "-") if "–" in std_edu else std_edu.replace("-", "–")

            edu_conds = [
                Course.target_education_level == std_edu,
                Course.target_education_level == alt_edu,
                Course.target_education_level.is_(None),
            ]

            if any(k in std_edu.lower() for k in ["puc", "11th", "12th", "higher secondary"]):
                edu_conds.extend([
                    Course.target_education_level == "PUC / 11th–12th",
                    Course.target_education_level == "PUC / 11th-12th",
                    Course.target_education_level == "Higher Secondary / PUC",
                ])
            elif any(k in std_edu.lower() for k in ["school", "class 7", "class 10"]):
                edu_conds.extend([
                    Course.target_education_level == "Higher School (Class 7–10)",
                    Course.target_education_level == "Higher School (Class 7-10)",
                    Course.target_education_level == "School (Class 7–10)",
                    Course.target_education_level == "School (Class 7-10)",
                ])
            elif "engineering" in std_edu.lower():
                edu_conds.extend([
                    Course.target_education_level == "Engineering",
                ])

            query = query.where(or_(*edu_conds))

            if current_user.semester:
                sem_str = current_user.semester
                digits = re.sub(r"\D", "", sem_str)
                sem_conditions = [
                    Course.target_year_semester.is_(None),
                    Course.target_year_semester == "",
                    Course.target_year_semester == sem_str,
                    Course.target_year_semester.ilike(f"%{sem_str}%"),
                ]
                if digits:
                    sem_conditions.append(Course.target_year_semester.ilike(f"%{digits}%"))
                query = query.where(or_(*sem_conditions))

            if current_user.course:
                course_str = current_user.course
                board_match = re.search(r"\b(CBSE|ICSE|State|IB)\b", course_str, re.IGNORECASE)
                board_kw = board_match.group(1) if board_match else None
                course_conds = [
                    Course.target_course.is_(None),
                    Course.target_course == "",
                    Course.target_course == course_str,
                    Course.target_course.ilike(f"%{course_str}%"),
                ]
                if board_kw:
                    course_conds.append(Course.target_course.ilike(f"%{board_kw}%"))
                if std_edu and ("School" in std_edu or "PUC" in std_edu):
                    course_conds.append(Course.target_education_level == std_edu)
                    course_conds.append(Course.target_education_level == alt_edu)

                query = query.where(or_(*course_conds))

            if current_user.branch:
                query = query.where(
                    or_(
                        Course.target_branch.is_(None),
                        Course.target_branch == "",
                        Course.target_branch.ilike("General"),
                        Course.target_branch.ilike("Other"),
                        Course.target_branch == current_user.branch,
                        Course.target_branch.ilike(f"%{current_user.branch}%"),
                    )
                )
            else:
                query = query.where(
                    or_(
                        Course.target_branch.is_(None),
                        Course.target_branch == "",
                        Course.target_branch.ilike("General"),
                        Course.target_branch.ilike("Other"),
                    )
                )

    # purpose : Filter courses by course level.
    if level:
        query = query.where(
            Course.level == level
        )

    # purpose : Filter courses by published status.
    if is_published is not None:
        query = query.where(
            Course.is_published == is_published
        )

    courses = list(
        db.execute(query).scalars().all()
    )

    # purpose : Temporarily log results from the non-paginated courses endpoint.
    print(
        "COURSE LIST DEBUG:",
        {
            "current_user_id": current_user.id if current_user else None,
            "my_courses": my_courses,
            "course_ids": [course.id for course in courses],
            "teacher_ids": [course.teacher_id for course in courses],
        },
    )

    return courses


# ------------------------------------------------------------------
# Get Course By ID
# ------------------------------------------------------------------

@router.get(
    "/{course_id}",
    response_model=CourseResponse,
)
def get_course_by_id(
    course_id: int,
    db: Session = Depends(get_db),
):
    # purpose : Retrieve a single course by its unique ID.
    service = CourseService(db)

    return service.get_course_by_id(
        course_id
    )


# ------------------------------------------------------------------
# Update Course
# ------------------------------------------------------------------

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
    # purpose : Update a course through the course service for the authenticated teacher.
    service = CourseService(db)

    return service.update_course(
        course_id,
        course_data,
        current_user,
    )


# ------------------------------------------------------------------
# Delete Course
# ------------------------------------------------------------------

@router.delete(
    "/{course_id}",
)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # purpose : Delete a course through the course service for the authenticated teacher.
    service = CourseService(db)

    return service.delete_course(
        course_id,
        current_user,
    )