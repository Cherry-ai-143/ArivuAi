from sqlalchemy.orm import Session

from app.models.uploaded_file import UploadedFile


class UploadedFileRepository:

    def __init__(self, db: Session):
        self.db = db

    # Create Uploaded File
    def create(
        self,
        uploaded_file: UploadedFile,
    ) -> UploadedFile:

        self.db.add(uploaded_file)
        self.db.commit()
        self.db.refresh(uploaded_file)

        return uploaded_file

    # Get All Uploaded Files
    def get_all(self) -> list[UploadedFile]:

        return (
            self.db.query(UploadedFile)
            .all()
        )

    # Get Uploaded File By ID
    def get_by_id(
        self,
        uploaded_file_id: int,
    ) -> UploadedFile | None:

        return (
            self.db.query(UploadedFile)
            .filter(
                UploadedFile.id == uploaded_file_id
            )
            .first()
        )

    # Delete Uploaded File
    def delete(
        self,
        uploaded_file: UploadedFile,
    ):

        self.db.delete(uploaded_file)
        self.db.commit()