from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from app.models.lesson_resource import LessonResource
from app.schemas.lesson_resource import LessonResourceCreate, LessonResourceUpdate


class LessonResourceRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_resource(self, lesson_id: int, data: LessonResourceCreate) -> LessonResource:
        resource = LessonResource(
            lesson_id=lesson_id,
            title=data.title,
            resource_type=data.resource_type,
            url=data.url,
            file_path=data.file_path,
            file_size=data.file_size,
            author=data.author,
            description=data.description,
        )
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def get_lesson_resources(self, lesson_id: int) -> list[LessonResource]:
        query = (
            select(LessonResource)
            .where(LessonResource.lesson_id == lesson_id)
            .order_by(LessonResource.created_at.desc())
        )
        result = self.db.execute(query).scalars().all()
        return list(result)

    def get_resource_by_id(self, resource_id: int, lesson_id: int | None = None) -> LessonResource | None:
        query = select(LessonResource).where(LessonResource.id == resource_id)
        if lesson_id is not None:
            query = query.where(LessonResource.lesson_id == lesson_id)
        return self.db.execute(query).scalar_one_or_none()

    def update_resource(self, resource: LessonResource, data: LessonResourceUpdate) -> LessonResource:
        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            if hasattr(resource, field):
                setattr(resource, field, value)
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def delete_resource(self, resource_id: int, lesson_id: int | None = None) -> LessonResource | None:
        resource = self.get_resource_by_id(resource_id, lesson_id)
        if resource:
            self.db.delete(resource)
            self.db.commit()
        return resource
