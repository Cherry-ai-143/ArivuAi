from typing import Any
from pydantic import BaseModel, ConfigDict


class StudentDashboardResponse(BaseModel):
    user: dict[str, Any]
    statistics: dict[str, Any]
    continue_learning: list[dict[str, Any]]
    recent_lessons: list[dict[str, Any]]
    pending_quizzes: list[dict[str, Any]]
    recommended_courses: list[dict[str, Any]]
    recommended_quizzes: list[dict[str, Any]]
    learning_streak: dict[str, Any]
    analytics: dict[str, Any]
    notifications: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)


class TeacherDashboardResponse(BaseModel):
    statistics: dict[str, Any]
    courses: list[dict[str, Any]]
    recent_assessments: list[dict[str, Any]]
    student_performance: dict[str, Any]
    analytics: dict[str, Any]
    recent_activity: list[dict[str, Any]]
    notifications: list[dict[str, Any]]
    uploads: list[dict[str, Any]]
    question_bank: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class AdminDashboardResponse(BaseModel):
    users: dict[str, Any]
    teachers: list[dict[str, Any]]
    students: list[dict[str, Any]]
    courses: dict[str, Any]
    lessons: dict[str, Any]
    uploads: dict[str, Any]
    analytics: dict[str, Any]
    system_health: dict[str, Any]
    notifications: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)
