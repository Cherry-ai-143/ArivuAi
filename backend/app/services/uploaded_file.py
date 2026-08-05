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

    MAX_FILE_SIZE = 25 * 1024 * 1024

    def __init__(self, db: Session):
        self.db = db
        self.repository = UploadedFileRepository(db)
        self.lesson_repository = LessonRepository(db)

    # Create Uploaded File
    def create_uploaded_file(
        self,
        file_data: UploadedFileCreate,
        file: UploadFile,
        current_user: User,
    ):

        # Check Lesson if provided
        if file_data.lesson_id is not None:
            lesson = self.lesson_repository.get_by_id(
                file_data.lesson_id,
            )

            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lesson not found.",
                )

            # Check Ownership
            if lesson.chapter.course.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized.",
                )

        # Validate Extension
        extension = os.path.splitext(
            file.filename
        )[1].lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file extension.",
            )

        # Validate File Size
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum limit.",
            )

        # Save File to Disk Storage
        stored_filename, file_path = LocalStorage.save_file(
            file
        )

        # Return file reference if lesson_id is None (e.g. Course Thumbnail)
        if file_data.lesson_id is None:
            return UploadedFileResponse(
                id=0,
                lesson_id=None,
                title=file_data.title,
                original_filename=file.filename or "file",
                stored_filename=stored_filename,
                file_url=file_path,
                file_size=file_size,
                mime_type=file.content_type or "application/octet-stream",
                uploaded_by=current_user.id,
                created_at=datetime.now(),
            )

        # Create Database Object for Lesson File
        uploaded_file = UploadedFile(
            lesson_id=file_data.lesson_id,
            title=file_data.title,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_url=file_path,
            file_size=file_size,
            mime_type=file.content_type or "application/octet-stream",
            uploaded_by=current_user.id,
        )

        # Save to Database
        uploaded_file = self.repository.create(
            uploaded_file,
        )

        # Process PDF if document file
        if extension == ".pdf":
            try:
                processor = DocumentProcessingService(
                    self.db,
                )
                processor.process_pdf(
                    uploaded_file,
                )
            except Exception as e:
                print(f"PDF processing warning: {e}")

        return uploaded_file

    # Get All Uploaded Files
    def get_all_uploaded_files(
        self,
    ):

        return self.repository.get_all()

    # Get Uploaded File By ID
    def get_uploaded_file_by_id(
        self,
        uploaded_file_id: int,
    ):

        uploaded_file = self.repository.get_by_id(
            uploaded_file_id,
        )

        if not uploaded_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded file not found.",
            )

        return uploaded_file

    # Delete Uploaded File
    def delete_uploaded_file(
        self,
        uploaded_file_id: int,
        current_user: User,
    ):

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

        if os.path.exists(
            uploaded_file.file_url,
        ):
            os.remove(
                uploaded_file.file_url,
            )

        self.repository.delete(
            uploaded_file,
        )

        return {
            "message": "File deleted successfully."
        }