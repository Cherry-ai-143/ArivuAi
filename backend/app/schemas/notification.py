from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: str = "System Message"
    link: str | None = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
