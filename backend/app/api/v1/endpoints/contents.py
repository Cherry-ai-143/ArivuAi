from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import (
    ContentCreate,
    ContentResponse,
    ContentUpdate,
)
from app.services.content import ContentService

router = APIRouter()


# Create Content
@router.post(
    "/",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ContentService(db)

    return service.create_content(
        content_data,
        current_user,
    )


# Get All Contents
@router.get(
    "/",
    response_model=list[ContentResponse],
)
def get_all_contents(
    db: Session = Depends(get_db),
):
    service = ContentService(db)

    return service.get_all_contents()


# Get Content By ID
@router.get(
    "/{content_id}",
    response_model=ContentResponse,
)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
):
    service = ContentService(db)

    return service.get_content_by_id(
        content_id,
    )


# Update Content
@router.put(
    "/{content_id}",
    response_model=ContentResponse,
)
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ContentService(db)

    return service.update_content(
        content_id,
        content_data,
        current_user,
    )


# Delete Content
@router.delete(
    "/{content_id}",
)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ContentService(db)

    return service.delete_content(
        content_id,
        current_user,
    )