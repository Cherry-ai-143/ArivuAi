from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AttemptStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"


class AssessmentAttemptCreate(BaseModel):
    assessment_id: int


class AssessmentAttemptResponse(BaseModel):
    id: int
    assessment_id: int
    student_id: int
    status: AttemptStatus
    score: int | None
    started_at: datetime
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentAttemptUpdate(BaseModel):
    status: AttemptStatus | None = None
    score: int | None = None
    submitted_at: datetime | None = None