from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.role_checker import RoleChecker
from app.models.user import User
from app.schemas.assignment import (
    AIAssignmentGenRequest,
    AIAssignmentGenResponse,
    AssignmentCreate,
    AssignmentDetailResponse,
    AssignmentResponse,
    AssignmentStatsResponse,
    AssignmentUpdate,
    SubmissionCreate,
    SubmissionResponse,
)
from app.services.assignment_ai_service import AssignmentAIService
from app.services.assignment_service import AssignmentService

router = APIRouter()
allow_teacher = RoleChecker(["teacher", "admin", "TEACHER", "ADMIN"])
allow_student = RoleChecker(["student", "teacher", "admin", "STUDENT", "TEACHER", "ADMIN"])


# ----------------------------------------------------
# List & Stats
# ----------------------------------------------------
@router.get(
    "/",
    response_model=List[AssignmentResponse],
    summary="List assignments for teacher or student",
)
def list_assignments(
    status: Optional[str] = Query(None, description="Status filter (All, Active, Pending Review, Completed, Draft, To Do, Submitted, Graded, Overdue)"),
    course_id: Optional[int] = Query(None, description="Filter by Course ID"),
    assignment_type: Optional[str] = Query(None, description="Assignment type filter"),
    difficulty: Optional[str] = Query(None, description="Difficulty filter"),
    search: Optional[str] = Query(None, description="Search by title or course"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssignmentService(db)

    user_role = str(
        current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    ).lower()

    if user_role in ["teacher", "admin"]:

        return service.list_teacher_assignments(
            current_user=current_user,
            status_filter=status,
            course_id=course_id,
            assignment_type=assignment_type,
            difficulty=difficulty,
            search=search,
        )
    else:
        student_results = service.list_student_assignments(
            current_user=current_user,
            status_filter=status,
            course_id=course_id,
            search=search,
        )
        # Convert student item format to AssignmentResponse
        output = []
        for item in student_results:
            sub_status = item["submission_status"]
            sub_status_val = sub_status.value if hasattr(sub_status, "value") else str(sub_status)
            output.append(
                AssignmentResponse(
                    id=item["id"],
                    course_id=item["course_id"],
                    lesson_id=item["lesson_id"],
                    teacher_id=0,
                    title=item["title"],
                    description=item["description"] or "",
                    instructions="",
                    assignment_type=item["assignment_type"],
                    difficulty=item["difficulty"],
                    max_points=item["max_points"],
                    due_date=item["due_date"],
                    status=sub_status_val,
                    created_at=item["due_date"] or current_user.created_at,
                    updated_at=item["due_date"] or current_user.created_at,
                    course_title=item["course_title"],
                    lesson_title=item["lesson_title"],
                )
            )
        return output



@router.get(
    "/stats",
    response_model=AssignmentStatsResponse,
    summary="Get teacher assignment summary statistics",
)
def get_teacher_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.get_teacher_stats(current_user)


# ----------------------------------------------------
# AI Assignment Generation
# ----------------------------------------------------
@router.post(
    "/generate-ai",
    response_model=AIAssignmentGenResponse,
    summary="Generate draft assignment with Gemini AI",
)
def generate_assignment_with_ai(
    req: AIAssignmentGenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    ai_service = AssignmentAIService(db)
    return ai_service.generate_assignment(req)


# ----------------------------------------------------
# Assignment CRUD
# ----------------------------------------------------
@router.post(
    "/",
    response_model=AssignmentDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assignment (Teacher)",
)
def create_assignment(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.create_assignment(current_user, data)


@router.get(
    "/{assignment_id}",
    summary="Get detailed assignment info (Teacher or Student view)",
)
def get_assignment_detail(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssignmentService(db)
    if current_user.role.value in ["TEACHER", "ADMIN"]:
        return service.get_assignment_detail(assignment_id, current_user)
    else:
        return service.get_student_assignment_detail(assignment_id, current_user)


@router.put(
    "/{assignment_id}",
    response_model=AssignmentDetailResponse,
    summary="Update an existing assignment (Teacher)",
)
def update_assignment(
    assignment_id: int,
    data: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.update_assignment(assignment_id, current_user, data)


@router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an assignment (Teacher)",
)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    service.delete_assignment(assignment_id, current_user)
    return None


@router.post(
    "/{assignment_id}/publish",
    response_model=AssignmentDetailResponse,
    summary="Publish draft assignment (Teacher)",
)
def publish_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.publish_assignment(assignment_id, current_user)


@router.post(
    "/{assignment_id}/duplicate",
    response_model=AssignmentDetailResponse,
    summary="Duplicate assignment into a new draft (Teacher)",
)
def duplicate_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.duplicate_assignment(assignment_id, current_user)


# ----------------------------------------------------
# Student Submissions Endpoints under Assignment
# ----------------------------------------------------
@router.get(
    "/{assignment_id}/my-submission",
    response_model=Optional[SubmissionResponse],
    summary="Get current student's active submission draft/final",
)
def get_my_submission(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssignmentService(db)
    submission = service.repo.get_student_submission(assignment_id, current_user.id)
    if not submission:
        return None
    return SubmissionResponse.model_validate(submission)


@router.post(
    "/{assignment_id}/submissions",
    response_model=SubmissionResponse,
    summary="Save draft or submit assignment (Student)",
)
def submit_assignment(
    assignment_id: int,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AssignmentService(db)
    return service.submit_assignment(assignment_id, current_user, data)


@router.get(
    "/{assignment_id}/submissions",
    summary="List all student submissions for an assignment (Teacher)",
)
def list_assignment_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_teacher),
):
    service = AssignmentService(db)
    return service.list_assignment_submissions(assignment_id, current_user)
