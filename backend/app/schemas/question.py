from pydantic import BaseModel, ConfigDict


class QuestionCreate(BaseModel):
    assessment_id: int | None = None
    lesson_id: int | None = None
    question_text: str
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_option: str | None = None
    correct_answer: str | None = None
    marks: int = 1
    order_number: int = 1
    difficulty: str | None = "Medium"
    question_type: str | None = "MULTIPLE_CHOICE"
    type: str | None = "MULTIPLE_CHOICE"
    bloom_level: str | None = "Understanding"
    status: str | None = "Approved"
    source: str | None = "Manual"
    explanation: str | None = None
    shuffle_options: bool | None = True
    tags: list[str] | None = None
    is_ai_generated: bool | None = False
    ai_version: str | None = None
    source_type: str | None = None
    source_attribution: str | None = None
    ai_confidence: int | None = None

    model_config = ConfigDict(extra="ignore", from_attributes=True)


class QuestionResponse(BaseModel):
    id: int
    assessment_id: int | None = None
    lesson_id: int | None = None
    lesson_title: str | None = None
    question_text: str
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_option: str | None = None
    correct_answer: str | None = None
    marks: int = 1
    order_number: int = 1
    difficulty: str | None = "Medium"
    question_type: str | None = "MULTIPLE_CHOICE"
    type: str | None = "MULTIPLE_CHOICE"
    bloom_level: str | None = "Understanding"
    status: str | None = "Approved"
    source: str | None = "Manual"
    explanation: str | None = None
    is_ai_generated: bool | None = False
    ai_version: str | None = None
    source_type: str | None = None
    source_attribution: str | None = None
    ai_confidence: int | None = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class QuestionUpdate(BaseModel):
    assessment_id: int | None = None
    lesson_id: int | None = None
    question_text: str | None = None
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_option: str | None = None
    correct_answer: str | None = None
    marks: int | None = None
    order_number: int | None = None
    difficulty: str | None = None
    bloom_level: str | None = None
    explanation: str | None = None
    status: str | None = None

    model_config = ConfigDict(extra="ignore", from_attributes=True)