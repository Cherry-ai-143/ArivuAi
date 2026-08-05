from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BookmarkCreate(BaseModel):
    lesson_id: int


class BookmarkResponse(BaseModel):
    id: int
    student_id: int
    lesson_id: int
    created_at: datetime
    lesson_title: Optional[str] = None
    course_id: Optional[int] = None
    course_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
