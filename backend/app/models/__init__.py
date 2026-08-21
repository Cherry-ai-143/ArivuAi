from app.models.user import User
from app.models.assessment import Assessment
from app.models.assessment_question import AssessmentQuestion
from app.models.question import Question
from app.models.assessment_attempt import AssessmentAttempt
from app.models.student_answer import StudentAnswer
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.content import Content
from app.models.uploaded_file import UploadedFile
from app.models.document_chunk import DocumentChunk
from app.models.notification import Notification
from app.models.lesson_resource import LessonResource
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.lesson_progress import LessonProgress
from app.models.study_session import StudySession
from app.models.student_bookmark import StudentBookmark
from app.models.ai_generation_job import AIGenerationJob
from app.models.ai_generation_question import AIGenerationQuestion
from app.models.ai_generation_chunk import AIGenerationChunk
from app.models.ai_generation_log import AIGenerationLog
from app.models.prompt_template import PromptTemplate
from app.models.resource_cache import ResourceCache
from app.models.assignment import (
    Assignment,
    AssignmentRubric,
    AssignmentSubmission,
)