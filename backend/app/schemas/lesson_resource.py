from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LessonResourceCreate(BaseModel):
    title: str
    resource_type: str
    url: str | None = None
    file_path: str | None = None
    file_size: int | None = None
    author: str | None = None
    description: str | None = None


class LessonResourceUpdate(BaseModel):
    title: str | None = None
    resource_type: str | None = None
    url: str | None = None
    author: str | None = None
    description: str | None = None


class LessonResourceResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    resource_type: str
    url: str | None = None
    file_path: str | None = None
    file_size: int | None = None
    author: str | None = None
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LessonResourceGroupedResponse(BaseModel):
    pdfs: list[LessonResourceResponse] = []
    videos: list[LessonResourceResponse] = []
    youtube: list[LessonResourceResponse] = []
    github: list[LessonResourceResponse] = []
    ppt: list[LessonResourceResponse] = []
    books: list[LessonResourceResponse] = []
    notes: list[LessonResourceResponse] = []
    links: list[LessonResourceResponse] = []
    all_resources: list[LessonResourceResponse] = []
