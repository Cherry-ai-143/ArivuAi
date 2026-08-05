from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.uploaded_file import (
    UploadedFileCreate,
    UploadedFileResponse,
)
from app.services.uploaded_file import UploadedFileService

router = APIRouter()


# Upload File
@router.post(
    "/",
    response_model=UploadedFileResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_file(
    title: str = Form(...),
    file: UploadFile = File(...),
    lesson_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = UploadedFileService(db)

    return service.create_uploaded_file(
        UploadedFileCreate(
            lesson_id=lesson_id,
            title=title,
        ),
        file,
        current_user,
    )


# Get All Uploaded Files
@router.get(
    "/",
    response_model=list[UploadedFileResponse],
)
def get_all_uploaded_files(
    db: Session = Depends(get_db),
):

    service = UploadedFileService(db)

    return service.get_all_uploaded_files()


# Get Uploaded File By ID
@router.get(
    "/{uploaded_file_id}",
    response_model=UploadedFileResponse,
)
def get_uploaded_file(
    uploaded_file_id: int,
    db: Session = Depends(get_db),
):

    service = UploadedFileService(db)

    return service.get_uploaded_file_by_id(
        uploaded_file_id,
    )


# Delete Uploaded File
@router.delete(
    "/{uploaded_file_id}",
)
def delete_uploaded_file(
    uploaded_file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = UploadedFileService(db)

    return service.delete_uploaded_file(
        uploaded_file_id,
        current_user,
    )