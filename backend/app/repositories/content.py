from sqlalchemy.orm import Session

from app.models.content import Content
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
)


class ContentRepository:

    def __init__(self, db: Session):
        self.db = db

    # Create Content
    def create(
        self,
        content_data: ContentCreate,
    ) -> Content:

        content = Content(
            **content_data.model_dump(),
        )

        self.db.add(content)
        self.db.commit()
        self.db.refresh(content)

        return content

    # Get All Contents
    def get_all(self) -> list[Content]:
        return (
            self.db.query(Content)
            .all()
        )

    # Get Content By ID
    def get_by_id(
        self,
        content_id: int,
    ) -> Content | None:

        return (
            self.db.query(Content)
            .filter(Content.id == content_id)
            .first()
        )

    # Update Content
    def update(
        self,
        content: Content,
        content_data: ContentUpdate,
    ) -> Content:

        update_data = content_data.model_dump(
            exclude_unset=True,
        )

        for key, value in update_data.items():
            setattr(content, key, value)

        self.db.commit()
        self.db.refresh(content)

        return content

    # Delete Content
    def delete(
        self,
        content: Content,
    ):

        self.db.delete(content)
        self.db.commit()