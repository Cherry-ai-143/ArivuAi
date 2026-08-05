from pydantic import BaseModel, Field


class QuizGenerationRequest(BaseModel):
    difficulty: str = Field(default="Beginner")
    num_questions: int = Field(default=5, ge=1, le=20)