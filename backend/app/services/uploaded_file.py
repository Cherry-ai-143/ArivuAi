# purpose : Manage uploaded course-wide and lesson-level study materials,
# including validation, storage, database persistence, PDF processing,
# filtered retrieval, and deletion.

from datetime import datetime
import os

from fastapi import (
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.models.uploaded_file import UploadedFile
from app.models.user import User
from app.repositories.course import CourseRepository
from app.repositories.lesson import LessonRepository
from app.repositories.uploaded_file import UploadedFileRepository
from app.schemas.uploaded_file import (
    UploadedFileCreate,
    UploadedFileResponse,
)
from app.storage.local_storage import LocalStorage
from app.ai.services.document_processing_service import (
    DocumentProcessingService,
)


class UploadedFileService:

    # purpose : Define supported study-material file types.
    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".ppt",
        ".pptx",
        ".doc",
        ".docx",
        ".txt",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
    }

    # purpose : Protect the application from excessively large uploads.
    MAX_FILE_SIZE = 25 * 1024 * 1024

    def __init__(self, db: Session):
        # purpose : Initialize database repositories used by the upload service.
        self.db = db
        self.repository = UploadedFileRepository(db)
        self.lesson_repository = LessonRepository(db)
        self.course_repository = CourseRepository(db)

    # ------------------------------------------------------------------
    # Create Uploaded File
    # ------------------------------------------------------------------

    def create_uploaded_file(
        self,
        file_data: UploadedFileCreate,
        file: UploadFile,
        current_user: User,
    ):
        # purpose : Validate ownership and file information, save the file,
        # create its database record, and process PDFs for AI document use.

        # Reject invalid course/lesson combinations.
        if (
            file_data.lesson_id is not None
            and file_data.course_id is not None
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provide either lesson_id or course_id, not both.",
            )

        # --------------------------------------------------------------
        # Check Lesson
        # --------------------------------------------------------------

        if file_data.lesson_id is not None:
            lesson = self.lesson_repository.get_by_id(
                file_data.lesson_id,
            )

            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lesson not found.",
                )

            # purpose : Ensure the teacher uploading a lesson material
            # owns the course containing that lesson.
            if lesson.chapter.course.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized.",
                )

        # --------------------------------------------------------------
        # Check Course
        # --------------------------------------------------------------

        if file_data.course_id is not None:
            course = self.course_repository.get_course_by_id(
                file_data.course_id,
            )

            if not course:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Course not found.",
                )

            # purpose : Ensure course-wide materials can only be uploaded
            # by the teacher who owns the course.
            if course.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized.",
                )

        # --------------------------------------------------------------
        # Validate Extension
        # --------------------------------------------------------------

        extension = os.path.splitext(
            file.filename or ""
        )[1].lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file extension.",
            )

        # --------------------------------------------------------------
        # Validate File Size
        # --------------------------------------------------------------

        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum limit.",
            )

        # --------------------------------------------------------------
        # Save File To Disk
        # --------------------------------------------------------------

        stored_filename, file_path = LocalStorage.save_file(
            file
        )

        # --------------------------------------------------------------
        # Unassociated File
        # --------------------------------------------------------------

        # purpose : Return a temporary file reference when the upload is
        # not associated with either a lesson or course.
        if (
            file_data.lesson_id is None
            and file_data.course_id is None
        ):
            return UploadedFileResponse(
                id=0,
                lesson_id=None,
                course_id=None,
                title=file_data.title,
                original_filename=file.filename or "file",
                stored_filename=stored_filename,
                file_url=file_path,
                file_size=file_size,
                mime_type=file.content_type
                or "application/octet-stream",
                uploaded_by=current_user.id,
                created_at=datetime.now(),
            )

        # --------------------------------------------------------------
        # Create Database Object
        # --------------------------------------------------------------

        # purpose : Persist the relationship between the uploaded file
        # and either its lesson or course.
        uploaded_file = UploadedFile(
            lesson_id=file_data.lesson_id,
            course_id=file_data.course_id,
            title=file_data.title,
            original_filename=file.filename or "file",
            stored_filename=stored_filename,
            file_url=file_path,
            file_size=file_size,
            mime_type=file.content_type
            or "application/octet-stream",
            uploaded_by=current_user.id,
        )

        # --------------------------------------------------------------
        # Save Database Record
        # --------------------------------------------------------------

        uploaded_file = self.repository.create(
            uploaded_file,
        )

        # --------------------------------------------------------------
        # Process PDF
        # --------------------------------------------------------------

        # purpose : Extract/process PDF content for downstream AI
        # document processing when the uploaded material is a PDF.
        if extension == ".pdf":
            try:
                processor = DocumentProcessingService(
                    self.db,
                )

                processor.process_pdf(
                    uploaded_file,
                )

            except Exception as e:
                print(
                    f"PDF processing warning: {e}"
                )

        return uploaded_file

    # ------------------------------------------------------------------
    # Get Uploaded Files
    # ------------------------------------------------------------------

    def get_all_uploaded_files(
        self,
        course_id: int | None = None,
        lesson_id: int | None = None,
    ):
        # purpose : Retrieve uploaded files by course or lesson.
        # This allows the student portal and curriculum editor to request
        # only the materials belonging to the current context.

        # Course-wide materials.
        if course_id is not None:
            return (
                self.db.query(UploadedFile)
                .filter(
                    UploadedFile.course_id == course_id
                )
                .all()
            )

        # Lesson-specific materials.
        if lesson_id is not None:
            return (
                self.db.query(UploadedFile)
                .filter(
                    UploadedFile.lesson_id == lesson_id
                )
                .all()
            )

        # Backward-compatible behavior:
        # return all uploaded files if no filter is supplied.
        return self.repository.get_all()

    # ------------------------------------------------------------------
    # Get Uploaded File By ID
    # ------------------------------------------------------------------

    def get_uploaded_file_by_id(
        self,
        uploaded_file_id: int,
    ):
        # purpose : Retrieve a single uploaded file using its database ID.

        uploaded_file = self.repository.get_by_id(
            uploaded_file_id,
        )

        if not uploaded_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded file not found.",
            )

        return uploaded_file

    # ------------------------------------------------------------------
    # Delete Uploaded File
    # ------------------------------------------------------------------

    def delete_uploaded_file(
        self,
        uploaded_file_id: int,
        current_user: User,
    ):
        # purpose : Delete an uploaded file only when the requesting
        # teacher owns that file.

        uploaded_file = self.repository.get_by_id(
            uploaded_file_id,
        )

        if not uploaded_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded file not found.",
            )

        if uploaded_file.uploaded_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized.",
            )

        # purpose : Remove the physical file from local storage.
        if os.path.exists(
            uploaded_file.file_url,
        ):
            os.remove(
                uploaded_file.file_url,
            )

        # purpose : Remove the corresponding database record.
        self.repository.delete(
            uploaded_file,
        )

        return {
            "message": "File deleted successfully."
        }