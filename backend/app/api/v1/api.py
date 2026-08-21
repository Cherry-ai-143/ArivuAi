from fastapi import APIRouter

from app.api.v1.endpoints import (
    users,
    auth,
    assessments,
    questions,
    assessment_attempts,
    student_answers,
    results,
    courses,
    chapters,
    lessons,
    contents,
    uploaded_files,
    dashboard,
    notifications,
    search,
    enrollments,
    progress,
    study,
    bookmarks,
    ai,
    assignments,
    submissions,
)

api_router = APIRouter()

# Register Users Router
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

# Register Auth Router
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

# Register Dashboard Aggregation Router
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

# Register Notifications Router
api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["Notifications"],
)

# Register Search Router
api_router.include_router(
    search.router,
    prefix="/search",
    tags=["Search"],
)

# Register Enrollments Router
api_router.include_router(
    enrollments.router,
    prefix="/enrollments",
    tags=["Course Enrollments"],
)

# Register Progress Router
api_router.include_router(
    progress.router,
    prefix="/progress",
    tags=["Lesson & Course Progress"],
)

# Register Continue Learning Router (/learning/continue)
api_router.include_router(
    progress.router,
    prefix="/learning",
    tags=["Learning"],
)

# Register Study Sessions Router
api_router.include_router(
    study.router,
    prefix="/study",
    tags=["Study Sessions"],
)

# Register Student Bookmarks Router
api_router.include_router(
    bookmarks.router,
    prefix="/bookmarks",
    tags=["Student Bookmarks"],
)

# Register Assessments Router
api_router.include_router(
    assessments.router,
    prefix="/assessments",
    tags=["Assessments"],
)

# Register Questions Router
api_router.include_router(
    questions.router,
    prefix="/questions",
    tags=["Questions"],
)

# Register Assessment Attempts Router
api_router.include_router(
    assessment_attempts.router,
    prefix="/assessment-attempts",
    tags=["Assessment Attempts"],
)

# Register Student Answers Router
api_router.include_router(
    student_answers.router,
    prefix="/student-answers",
    tags=["Student Answers"],
)

# Register Results Router
api_router.include_router(
    results.router,
    prefix="/results",
    tags=["Results"],
)

# Register Courses Router
api_router.include_router(
    courses.router,
    prefix="/courses",
    tags=["Courses"],
)

# Register Chapters Router
api_router.include_router(
    chapters.router,
    prefix="/chapters",
    tags=["Chapters"],
)

# Register Lessons Router
api_router.include_router(
    lessons.router,
    prefix="/lessons",
    tags=["Lessons"],
)

# Register Contents Router
api_router.include_router(
    contents.router,
    prefix="/contents",
    tags=["Contents"],
)

# Register Uploaded Files Router
api_router.include_router(
    uploaded_files.router,
    prefix="/uploaded-files",
    tags=["Uploaded Files"],
)

# Register AI Question Generation Router
api_router.include_router(
    ai.router,
    prefix="/ai",
    tags=["AI Question Generator"],
)

# Register Assignments Router
api_router.include_router(
    assignments.router,
    prefix="/assignments",
    tags=["Assignments"],
)

# Register Submissions Router
api_router.include_router(
    submissions.router,
    prefix="/submissions",
    tags=["Submissions"],
)