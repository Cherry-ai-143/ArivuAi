from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Create Lesson
class LessonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order_number: int
    chapter_id: int


# Update Lesson
class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_number: Optional[int] = None
    is_published: Optional[bool] = None


# Lesson Response
class LessonResponse(BaseModel):
    id: int
    chapter_id: int
    title: str
    description: Optional[str]
    order_number: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )