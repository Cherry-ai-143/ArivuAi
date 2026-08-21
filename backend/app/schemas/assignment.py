from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.enums.assignment import (
    AssignmentDifficulty,
    AssignmentStatus,
    AssignmentType,
    GradingMethod,
    SubmissionStatus,
)


# ----------------------------------------------------
# Rubric Criteria Schemas
# ----------------------------------------------------
class RubricCriterionCreate(BaseModel):
    criterion_name: str = Field(..., min_length=1)
    max_points: int = Field(..., gt=0)
    description: Optional[str] = None
    order_index: int = 0


class RubricCriterionResponse(RubricCriterionCreate):
    id: int
    assignment_id: int

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------
# Configuration Sub-Schemas
# ----------------------------------------------------
class SubmissionConfigSchema(BaseModel):
    allowed_methods: List[str] = Field(default_factory=lambda: ["file", "text"])  # "text", "file", "url"
    allowed_file_types: List[str] = Field(default_factory=lambda: ["pdf", "docx", "zip"])
    max_file_size_mb: int = 25
    max_files_count: int = 5


class GradingConfigSchema(BaseModel):
    grading_method: GradingMethod = GradingMethod.MANUAL
    enable_ai_assistance: bool = True
    rubric_enabled: bool = False


class TypeConfigSchema(BaseModel):
    # Programming
    language: Optional[str] = None
    allow_repo_url: Optional[bool] = None
    allow_zip: Optional[bool] = None
    required_concepts: Optional[List[str]] = None
    # Problem solving
    step_by_step_required: Optional[bool] = None
    calculator_allowed: Optional[bool] = None
    # Research
    min_word_count: Optional[int] = None
    max_word_count: Optional[int] = None
    citation_format: Optional[str] = None
    required_sections: Optional[List[str]] = None
    # Creative
    accepted_media_formats: Optional[List[str]] = None


# ----------------------------------------------------
# Assignment Base / Create / Update / Response
# ----------------------------------------------------
class AssignmentCreate(BaseModel):
    course_id: int
    lesson_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=255)
    description: str
    instructions: str
    assignment_type: AssignmentType = AssignmentType.WRITTEN
    difficulty: AssignmentDifficulty = AssignmentDifficulty.MEDIUM
    max_points: int = Field(100, gt=0)
    due_date: Optional[datetime] = None
    status: AssignmentStatus = AssignmentStatus.DRAFT

    submission_config: Optional[Dict[str, Any]] = None
    grading_config: Optional[Dict[str, Any]] = None
    type_config: Optional[Dict[str, Any]] = None

    rubric_criteria: Optional[List[RubricCriterionCreate]] = None


class AssignmentUpdate(BaseModel):
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    assignment_type: Optional[AssignmentType] = None
    difficulty: Optional[AssignmentDifficulty] = None
    max_points: Optional[int] = None
    due_date: Optional[datetime] = None
    status: Optional[AssignmentStatus] = None

    submission_config: Optional[Dict[str, Any]] = None
    grading_config: Optional[Dict[str, Any]] = None
    type_config: Optional[Dict[str, Any]] = None

    rubric_criteria: Optional[List[RubricCriterionCreate]] = None


class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    lesson_id: Optional[int] = None
    teacher_id: int
    title: str
    description: str
    instructions: str
    assignment_type: AssignmentType
    difficulty: AssignmentDifficulty
    max_points: int
    due_date: Optional[datetime] = None
    status: Any

    submission_config: Optional[Dict[str, Any]] = None
    grading_config: Optional[Dict[str, Any]] = None
    type_config: Optional[Dict[str, Any]] = None


    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    # Aggregated metrics for teacher list
    course_title: Optional[str] = None
    lesson_title: Optional[str] = None
    total_submissions: int = 0
    total_enrolled: int = 0
    average_score: Optional[float] = None
    pending_review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class AssignmentDetailResponse(AssignmentResponse):
    rubric_criteria: List[RubricCriterionResponse] = Field(default_factory=list)


class AssignmentStatsResponse(BaseModel):
    total_assignments: int = 0
    active_assignments: int = 0
    pending_review_count: int = 0
    average_submission_rate: float = 0.0
    average_score: float = 0.0


# ----------------------------------------------------
# Student Submission Schemas
# ----------------------------------------------------
class SubmissionCreate(BaseModel):
    text_response: Optional[str] = None
    external_url: Optional[str] = None
    file_ids: Optional[List[Dict[str, Any]]] = None  # e.g., [{"id": 1, "filename": "doc.pdf", "url": "..."}]
    is_draft: bool = False


class SubmissionGrade(BaseModel):
    score: float = Field(..., ge=0)
    feedback: Optional[str] = None
    rubric_scores: Optional[Dict[str, float]] = None


class SubmissionRequestResubmission(BaseModel):
    reason: str = Field(..., min_length=3)


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    status: SubmissionStatus
    text_response: Optional[str] = None
    external_url: Optional[str] = None
    file_ids: Optional[List[Dict[str, Any]]] = None

    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    is_late: bool = False
    score: Optional[float] = None
    feedback: Optional[str] = None
    rubric_scores: Optional[Dict[str, float]] = None
    graded_at: Optional[datetime] = None
    graded_by: Optional[int] = None
    resubmission_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SubmissionDetailResponse(SubmissionResponse):
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_avatar: Optional[str] = None
    assignment_title: Optional[str] = None
    assignment_max_points: Optional[int] = None
    assignment_instructions: Optional[str] = None
    assignment_type: Optional[AssignmentType] = None
    rubric_criteria: List[RubricCriterionResponse] = Field(default_factory=list)


# ----------------------------------------------------
# AI Schemas
# ----------------------------------------------------
class AIAssignmentGenRequest(BaseModel):
    course_id: int
    lesson_id: Optional[int] = None
    topic: str
    assignment_type: AssignmentType = AssignmentType.WRITTEN
    difficulty: AssignmentDifficulty = AssignmentDifficulty.MEDIUM
    task_count: Optional[int] = Field(default=5, ge=1, le=20)
    custom_directives: Optional[str] = None
    custom_prompt: Optional[str] = None


class AIAssignmentGenResponse(BaseModel):
    title: str
    description: str
    instructions: str
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    assignment_type: AssignmentType
    difficulty: AssignmentDifficulty
    max_points: int
    submission_config: Dict[str, Any]
    grading_config: Optional[Dict[str, Any]] = None
    type_config: Optional[Dict[str, Any]] = None
    rubric_criteria: List[RubricCriterionCreate]
    optional_teacher_notes: Optional[str] = None



class AIGradingAnalysisResponse(BaseModel):
    suggested_score: float
    max_points: float
    rubric_breakdown: Optional[Dict[str, float]] = None
    strengths: List[str]
    areas_for_improvement: List[str]
    suggested_feedback: str
