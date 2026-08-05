from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentAnswerCreate(BaseModel):
    attempt_id: int
    question_id: int
    selected_option: str


class StudentAnswerResponse(BaseModel):
    id: int
    attempt_id: int
    question_id: int
    selected_option: str
    is_correct: bool | None
    marks_obtained: int | None
    answered_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentAnswerUpdate(BaseModel):
    selected_option: str | None = None
    is_correct: bool | None = None
    marks_obtained: int | None = None