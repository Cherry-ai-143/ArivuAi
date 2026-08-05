from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class LessonProgressUpdate(BaseModel):
    progress_percentage: int = Field(..., ge=0, le=100)
    time_spent_seconds: Optional[int] = Field(default=0, ge=0)


class LessonProgressResponse(BaseModel):
    id: int
    student_id: int
    lesson_id: int
    progress_percentage: int
    time_spent_seconds: int
    completed: bool
    started_at: datetime
    last_accessed: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CourseProgressResponse(BaseModel):
    course_id: int
    progress: int
    completed_lessons: int
    total_lessons: int


class ContinueLearningResponse(BaseModel):
    course_id: int
    course_title: str
    chapter_id: int
    chapter_title: str
    lesson_id: int
    lesson_title: str
    progress: int
    thumbnail: Optional[str] = None
    resume_url: str
