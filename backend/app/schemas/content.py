from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.enums import ContentType


# Create Content
class ContentCreate(BaseModel):
    lesson_id: int
    title: str
    content_type: ContentType
    file_url: str
    duration_minutes: Optional[int] = None
    order_number: int


# Update Content
class ContentUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[ContentType] = None
    file_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_number: Optional[int] = None
    is_published: Optional[bool] = None


# Response Content
class ContentResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    content_type: ContentType
    file_url: str
    duration_minutes: Optional[int]
    order_number: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )