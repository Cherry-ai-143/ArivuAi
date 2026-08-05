from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, data: NotificationCreate) -> Notification:
        notification = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            type=data.type,
            link=data.link,
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Notification], int]:
        query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            query = query.where(Notification.is_read == False)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = self.db.execute(count_query).scalar() or 0

        # Paginate
        query = query.order_by(Notification.created_at.desc())
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        items = self.db.execute(query).scalars().all()
        return list(items), total

    def mark_as_read(self, notification_id: int, user_id: int) -> Notification | None:
        query = select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        notification = self.db.execute(query).scalar_one_or_none()
        if notification:
            notification.is_read = True
            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: int) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount

    def delete_notification(self, notification_id: int, user_id: int) -> bool:
        stmt = delete(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount > 0
