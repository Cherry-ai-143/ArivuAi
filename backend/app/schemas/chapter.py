from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Create Chapter
class ChapterCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    order_number: int


# Update Chapter
class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_number: Optional[int] = None
    is_published: Optional[bool] = None


# Response
class ChapterResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    order_number: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)