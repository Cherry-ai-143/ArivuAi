from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class StudySessionStartRequest(BaseModel):
    lesson_id: int
    device_type: Optional[str] = None
    browser: Optional[str] = None


class StudySessionResponse(BaseModel):
    id: int
    student_id: int
    lesson_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: int
    device_type: Optional[str] = None
    browser: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StudySessionEndResponse(BaseModel):
    id: int
    started_at: datetime
    ended_at: datetime
    duration_seconds: int
