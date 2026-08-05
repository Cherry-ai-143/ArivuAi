from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationCreate
from app.schemas.pagination import PaginatedResponse
from app.services.notification import NotificationService

router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[NotificationResponse],
    summary="Get user notifications with pagination and unread filter",
)
def get_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    items, total = service.get_user_notifications(
        user=current_user,
        unread_only=unread_only,
        page=page,
        page_size=page_size,
    )
    pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return PaginatedResponse[NotificationResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.put(
    "/read-all",
    summary="Mark all user notifications as read",
)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    return service.mark_all_as_read(current_user)


@router.put(
    "/{id}/read",
    response_model=NotificationResponse,
    summary="Mark single notification as read",
)
def mark_notification_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    return service.mark_as_read(id, current_user)


@router.delete(
    "/{id}",
    summary="Delete a notification",
)
def delete_notification(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    return service.delete_notification(id, current_user)
