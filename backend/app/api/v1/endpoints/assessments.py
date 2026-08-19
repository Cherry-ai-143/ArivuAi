from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.enums.assessment import AssessmentStatus
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentStatusUpdate,
    AssessmentResponse,
    PublishedAssessmentResponse,
    StudentTakeAssessmentResponse,
)
from app.services.assessment import AssessmentService

router = APIRouter()


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new assessment + bridge links to Question Bank questions."""
    service = AssessmentService(db)
    return service.create_assessment(assessment_data, current_user)


@router.get("/", response_model=list[AssessmentResponse])
def get_assessments(
    course_id: int | None = None,
    status: AssessmentStatus | None = None,
    scope: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List assessments with optional filters (course, status, scope)."""
    service = AssessmentService(db)
    return service.get_all_assessments(
        course_id=course_id,
        status_filter=status,
        scope=scope,
    )


@router.get("/student/available", response_model=list[PublishedAssessmentResponse])
def get_available_student_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all published assessments for courses where current student is actively enrolled."""
    service = AssessmentService(db)
    return service.get_available_assessments_for_student(current_user)


@router.get("/published/lesson/{lesson_id}", response_model=PublishedAssessmentResponse | None)
def get_published_assessment_for_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch published assessment for a lesson + student attempts count.

    Used by the student lesson completion flow.
    """
    service = AssessmentService(db)
    return service.get_published_assessment_for_lesson(lesson_id, current_user)


@router.get("/{assessment_id}/take", response_model=StudentTakeAssessmentResponse)
def take_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch assessment questions securely for taking a test.
    Strips correct_option, correct_answer, explanation, AI fields.
    """
    service = AssessmentService(db)
    return service.get_assessment_for_student_take(assessment_id, current_user)


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get assessment details + linked questions."""
    service = AssessmentService(db)
    return service.get_assessment_by_id(assessment_id)


@router.put("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    assessment_data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update assessment details, settings, and bridge links."""
    service = AssessmentService(db)
    return service.update_assessment(assessment_id, assessment_data, current_user)


@router.patch("/{assessment_id}/status", response_model=AssessmentResponse)
def update_assessment_status(
    assessment_id: int,
    status_data: AssessmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update assessment status (PUBLISHED, DRAFT, ARCHIVED)."""
    service = AssessmentService(db)
    return service.update_status(assessment_id, status_data, current_user)


@router.delete("/{assessment_id}", status_code=status.HTTP_200_OK)
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an assessment."""
    service = AssessmentService(db)
    return service.delete_assessment(assessment_id, current_user)