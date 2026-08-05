from enum import Enum


class AssessmentStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class AssessmentType(str, Enum):
    QUIZ = "QUIZ"
    PRACTICE = "PRACTICE"
    CHAPTER_TEST = "CHAPTER_TEST"
    MIDTERM = "MIDTERM"
    FINAL = "FINAL"


class AssessmentScope(str, Enum):
    LESSON = "LESSON"
    CHAPTER = "CHAPTER"
    COURSE = "COURSE"