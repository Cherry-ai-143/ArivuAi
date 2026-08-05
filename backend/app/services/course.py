from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.enums import UserRole
from app.models.user import User
from app.repositories.course import CourseRepository
from app.schemas.course import CourseCreate, CourseUpdate


class CourseService:

    def __init__(self, db: Session):
        self.repository = CourseRepository(db)

    # Create Course
    def create_course(
        self,
        course_data: CourseCreate,
        current_user: User,
    ):

        if current_user.role not in [
            UserRole.TEACHER,
            UserRole.ADMIN,
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers and admins can create courses.",
            )

        existing_course = self.repository.get_course_by_title(
            current_user.id,
            course_data.title,
        )

        if existing_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course title already exists.",
            )

        return self.repository.create_course(
            current_user.id,
            course_data,
        )

    # Get Course
    def get_course_by_id(
        self,
        course_id: int,
    ):

        course = self.repository.get_course_by_id(course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found.",
            )

        return course

    # Get All Courses
    def get_all_courses(self):

        return self.repository.get_all_courses()

    # Update Course
    def update_course(
        self,
        course_id: int,
        course_data: CourseUpdate,
        current_user: User,
    ):

        course = self.get_course_by_id(course_id)

        if (
            current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]
            and course.teacher_id != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to update this course.",
            )

        return self.repository.update_course(
            course,
            course_data,
        )

    # Delete Course
    def delete_course(
        self,
        course_id: int,
        current_user: User,
    ):

        course = self.get_course_by_id(course_id)

        if (
            current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]
            and course.teacher_id != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to delete this course.",
            )

        self.repository.delete_course(course)

        return {
            "message": "Course deleted successfully."
        }