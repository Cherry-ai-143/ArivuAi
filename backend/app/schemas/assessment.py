from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.enums.assessment import (
    AssessmentStatus,
    AssessmentType,
    AssessmentScope,
)


# ----------------------------------------
# Assessment Question (bridge) Schemas
# ----------------------------------------
class AssessmentQuestionBase(BaseModel):
    question_id: int
    order_number: int = 1
    marks: int = 1


class AssessmentQuestionCreate(AssessmentQuestionBase):
    pass


class AssessmentQuestionResponse(BaseModel):
    id: int
    assessment_id: int
    question_id: int
    order_number: int
    marks: int

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------
# Create Assessment
# ----------------------------------------
class AssessmentCreate(BaseModel):
    title: str
    description: str | None = None
    assessment_type: AssessmentType = AssessmentType.QUIZ
    scope: AssessmentScope = AssessmentScope.LESSON
    course_id: int
    chapter_id: int | None = None
    lesson_id: int | None = None
    duration_minutes: int = 20
    passing_score: int = 60
    max_attempts: int = 3
    shuffle_questions: bool = True
    shuffle_options: bool = True
    show_correct_answers: bool = True
    question_ids: list[int] = []

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title is required")
        return v.strip()


# ----------------------------------------
# Update Assessment
# ----------------------------------------
class AssessmentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assessment_type: AssessmentType | None = None
    scope: AssessmentScope | None = None
    course_id: int | None = None
    chapter_id: int | None = None
    lesson_id: int | None = None
    duration_minutes: int | None = None
    passing_score: int | None = None
    max_attempts: int | None = None
    shuffle_questions: bool | None = None
    shuffle_options: bool | None = None
    show_correct_answers: bool | None = None
    question_ids: list[int] | None = None


# ----------------------------------------
# Status Update
# ----------------------------------------
class AssessmentStatusUpdate(BaseModel):
    status: AssessmentStatus


# ----------------------------------------
# Assessment Response
# ----------------------------------------
class AssessmentResponse(BaseModel):
    id: int
    title: str
    description: str | None
    assessment_type: AssessmentType
    scope: AssessmentScope
    status: AssessmentStatus
    course_id: int
    chapter_id: int | None
    lesson_id: int | None
    duration_minutes: int
    passing_score: int
    max_attempts: int
    shuffle_questions: bool
    shuffle_options: bool
    show_correct_answers: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
    total_marks: int = 0
    question_count: int = 0
    assessment_questions: list[AssessmentQuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------
# Published Assessment for Student (Lesson Completion Flow)
# ----------------------------------------
class PublishedAssessmentResponse(BaseModel):
    id: int
    title: str
    description: str | None
    assessment_type: AssessmentType
    scope: AssessmentScope
    duration_minutes: int
    passing_score: int
    max_attempts: int
    question_count: int = 0
    total_marks: int = 0
    attempts_used: int = 0
    attempts_remaining: int = 0

    model_config = ConfigDict(from_attributes=True)