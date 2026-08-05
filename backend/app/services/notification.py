from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.notification import Notification
from app.repositories.notification import NotificationRepository
from app.schemas.notification import NotificationCreate


class NotificationService:

    def __init__(self, db: Session):
        self.repository = NotificationRepository(db)

    def create_notification(self, data: NotificationCreate) -> Notification:
        return self.repository.create_notification(data)

    def get_user_notifications(
        self,
        user: User,
        unread_only: bool = False,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Notification], int]:
        return self.repository.get_user_notifications(
            user_id=user.id,
            unread_only=unread_only,
            page=page,
            page_size=page_size,
        )

    def mark_as_read(self, notification_id: int, user: User) -> Notification:
        notif = self.repository.mark_as_read(notification_id, user.id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        return notif

    def mark_all_as_read(self, user: User) -> dict:
        count = self.repository.mark_all_as_read(user.id)
        return {"message": "All notifications marked as read.", "count": count}

    def delete_notification(self, notification_id: int, user: User) -> dict:
        success = self.repository.delete_notification(notification_id, user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        return {"message": "Notification deleted successfully."}
