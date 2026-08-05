from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.assessment import Assessment
from app.models.course import Course
from app.models.lesson import Lesson
from app.repositories.assessment import AssessmentRepository
from app.repositories.question import QuestionRepository
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
)


class QuestionService:

    def __init__(self, db: Session):
        self.db = db
        self.question_repository = QuestionRepository(db)
        self.assessment_repository = AssessmentRepository(db)

    def create_question(
        self,
        question_data: QuestionCreate,
        current_user: User | None = None,
    ):
        if not current_user:
            current_user = self.db.query(User).filter(User.role == "TEACHER").first()

        # Determine user role safely
        role_name = "TEACHER"
        if current_user and hasattr(current_user, "role") and current_user.role:
            role_name = getattr(current_user.role, "name", str(current_user.role)).upper()

        if role_name not in ["TEACHER", "ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers and admins can create questions",
            )

        # Fallback assessment resolution matching lesson's course_id
        if question_data.lesson_id:
            lesson = self.db.query(Lesson).filter(Lesson.id == question_data.lesson_id).first()
            if lesson and lesson.chapter:
                target_course_id = lesson.chapter.course_id
                course_assessment = self.db.query(Assessment).filter(Assessment.course_id == target_course_id).first()
                if course_assessment:
                    question_data.assessment_id = course_assessment.id
                else:
                    new_assessment = Assessment(
                        title=f"Course #{target_course_id} Question Bank Assessment",
                        description="Default assessment repository for question bank items",
                        duration_minutes=30,
                        total_marks=100,
                        created_by=current_user.id,
                        course_id=target_course_id,
                    )
                    self.db.add(new_assessment)
                    self.db.commit()
                    self.db.refresh(new_assessment)
                    question_data.assessment_id = new_assessment.id

        if not question_data.assessment_id:
            all_assessments = self.assessment_repository.get_all_assessments()
            if all_assessments:
                question_data.assessment_id = all_assessments[0].id

        return self.question_repository.create_question(question_data)

    def get_all_questions(self):
        return self.question_repository.get_all_questions()

    def get_question_by_id(
        self,
        question_id: int,
    ):
        question = self.question_repository.get_question_by_id(question_id)

        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found",
            )

        return question

    def get_questions_by_assessment(
        self,
        assessment_id: int,
    ):
        return self.question_repository.get_questions_by_assessment(assessment_id)

    def update_question(
        self,
        question_id: int,
        question_data: QuestionUpdate,
        current_user: User,
    ):
        question = self.get_question_by_id(question_id)
        return self.question_repository.update_question(question, question_data)

    def delete_question(
        self,
        question_id: int,
        current_user: User,
    ):
        question = self.get_question_by_id(question_id)
        self.question_repository.delete_question(question)
        return {"message": "Question deleted successfully"}