# purpose : Handle course business rules, ownership checks, and course operations.

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.enums import UserRole
from app.models.user import User
from app.repositories.course import CourseRepository
from app.schemas.course import CourseCreate, CourseUpdate


class CourseService:

    def __init__(self, db: Session):
        # purpose : Initialize the course service with a database repository.
        self.repository = CourseRepository(db)

    def create_course(
        self,
        course_data: CourseCreate,
        current_user: User,
    ):
        # purpose : Allow only teachers/admins to create courses.

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
            course_data.title.strip(),
        )

        if existing_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course title already exists for this teacher.",
            )

        return self.repository.create_course(
            current_user.id,
            course_data,
        )

    def get_course_by_id(
        self,
        course_id: int,
    ):
        # purpose : Retrieve a course by its ID.

        course = self.repository.get_course_by_id(course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found.",
            )

        return course

    def get_all_courses(self):
        # purpose : Return all courses through the repository.

        return self.repository.get_all_courses()

    def update_course(
        self,
        course_id: int,
        course_data: CourseUpdate,
        current_user: User,
    ):
        # purpose : Update a course while enforcing teacher ownership.

        course = self.get_course_by_id(course_id)

        if (
            current_user.role != UserRole.ADMIN
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

    def delete_course(
        self,
        course_id: int,
        current_user: User,
    ):
        # purpose : Delete a course while enforcing teacher ownership.

        course = self.get_course_by_id(course_id)

        if (
            current_user.role != UserRole.ADMIN
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