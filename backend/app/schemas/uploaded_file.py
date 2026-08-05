from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Create Uploaded File
class UploadedFileCreate(BaseModel):
    title: str
    lesson_id: Optional[int] = None


# Update Uploaded File
class UploadedFileUpdate(BaseModel):
    title: Optional[str] = None


# Uploaded File Response
class UploadedFileResponse(BaseModel):
    id: int
    lesson_id: Optional[int] = None
    title: str
    original_filename: str
    stored_filename: str
    file_url: str
    file_size: int
    mime_type: str
    uploaded_by: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )