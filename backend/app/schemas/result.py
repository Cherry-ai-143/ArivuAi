from datetime import datetime

from pydantic import BaseModel


class AssessmentResultResponse(BaseModel):
    attempt_id: int
    assessment_title: str

    total_questions: int
    attempted_questions: int

    correct_answers: int
    wrong_answers: int

    total_marks: int
    obtained_marks: int

    percentage: float

    status: str

    started_at: datetime
    submitted_at: datetime | None

    time_taken_minutes: float