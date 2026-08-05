import os
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.models.lesson_resource import LessonResource
from app.repositories.lesson_resource import LessonResourceRepository
from app.schemas.lesson_resource import (
    LessonResourceCreate,
    LessonResourceUpdate,
    LessonResourceGroupedResponse,
)


class LessonResourceService:

    def __init__(self, db: Session):
        self.repository = LessonResourceRepository(db)

    def get_grouped_resources(self, lesson_id: int) -> LessonResourceGroupedResponse:
        resources = self.repository.get_lesson_resources(lesson_id)

        grouped = LessonResourceGroupedResponse(all_resources=resources)
        for r in resources:
            rtype = r.resource_type.upper()
            if "PDF" in rtype:
                grouped.pdfs.append(r)
            elif "YOUTUBE" in rtype:
                grouped.youtube.append(r)
            elif "VIDEO" in rtype:
                grouped.videos.append(r)
            elif "GITHUB" in rtype:
                grouped.github.append(r)
            elif "PPT" in rtype:
                grouped.ppt.append(r)
            elif "BOOK" in rtype:
                grouped.books.append(r)
            elif "NOTE" in rtype:
                grouped.notes.append(r)
            else:
                grouped.links.append(r)

        return grouped

    def upload_resource(
        self,
        lesson_id: int,
        title: str,
        resource_type: str,
        file: UploadFile | None = None,
        url: str | None = None,
        author: str | None = None,
        description: str | None = None,
    ) -> LessonResource:
        file_path = None
        file_size = None

        if file:
            contents = file.file.read()
            file_size = len(contents)

            upload_dir = os.path.join("uploads", "lessons", f"lesson_{lesson_id}")
            os.makedirs(upload_dir, exist_ok=True)

            file_path = os.path.join(upload_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(contents)

            if not url:
                url = f"/uploads/lessons/lesson_{lesson_id}/{file.filename}"

        data = LessonResourceCreate(
            title=title,
            resource_type=resource_type,
            url=url,
            file_path=file_path,
            file_size=file_size,
            author=author,
            description=description,
        )

        return self.repository.create_resource(lesson_id, data)

    def update_resource(
        self,
        lesson_id: int,
        resource_id: int,
        update_data: LessonResourceUpdate,
    ) -> LessonResource:
        resource = self.repository.get_resource_by_id(resource_id, lesson_id)
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson resource not found"
            )
        return self.repository.update_resource(resource, update_data)

    def delete_resource(self, lesson_id: int, resource_id: int) -> dict:
        resource = self.repository.get_resource_by_id(resource_id, lesson_id)
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson resource not found"
            )

        if resource.file_path and os.path.exists(resource.file_path):
            try:
                os.remove(resource.file_path)
            except Exception:
                pass

        self.repository.delete_resource(resource_id, lesson_id)
        return {"message": "Resource deleted successfully."}

    def get_resource_file_path(self, lesson_id: int, resource_id: int) -> str:
        resource = self.repository.get_resource_by_id(resource_id, lesson_id)
        if not resource or not resource.file_path or not os.path.exists(resource.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource file not found for download"
            )
        return resource.file_path
