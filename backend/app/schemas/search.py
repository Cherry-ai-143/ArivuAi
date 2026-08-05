from typing import Any
from pydantic import BaseModel, ConfigDict


class SearchResultItem(BaseModel):
    id: int
    title: str
    type: str
    description: str | None = None
    link: str | None = None
    extra: dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)


class GlobalSearchResponse(BaseModel):
    query: str
    total_results: int
    courses: list[SearchResultItem] = []
    lessons: list[SearchResultItem] = []
    chapters: list[SearchResultItem] = []
    assessments: list[SearchResultItem] = []
    questions: list[SearchResultItem] = []
    contents: list[SearchResultItem] = []

    model_config = ConfigDict(from_attributes=True)
