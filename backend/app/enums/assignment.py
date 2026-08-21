from enum import Enum as PyEnum


class AssignmentType(str, PyEnum):
    WRITTEN = "WRITTEN"
    PROBLEM_SOLVING = "PROBLEM_SOLVING"
    PROGRAMMING = "PROGRAMMING"
    PROJECT = "PROJECT"
    RESEARCH = "RESEARCH"
    CREATIVE = "CREATIVE"


class AssignmentDifficulty(str, PyEnum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class AssignmentStatus(str, PyEnum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PENDING_REVIEW = "PENDING_REVIEW"
    COMPLETED = "COMPLETED"


class SubmissionStatus(str, PyEnum):
    NOT_STARTED = "NOT_STARTED"
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    LATE = "LATE"
    UNDER_REVIEW = "UNDER_REVIEW"
    GRADED = "GRADED"
    RETURNED = "RETURNED"
    RESUBMISSION_REQUIRED = "RESUBMISSION_REQUIRED"


class GradingMethod(str, PyEnum):
    MANUAL = "MANUAL"
    RUBRIC = "RUBRIC"
    AI_ASSISTED = "AI_ASSISTED"
