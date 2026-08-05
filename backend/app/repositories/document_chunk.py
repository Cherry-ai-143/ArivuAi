from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk


class DocumentChunkRepository:

    def __init__(self, db: Session):
        self.db = db

    # Create Chunk
    def create(
        self,
        uploaded_file_id: int,
        chunk_index: int,
        chunk_text: str,
    ) -> DocumentChunk:

        chunk = DocumentChunk(
            uploaded_file_id=uploaded_file_id,
            chunk_index=chunk_index,
            chunk_text=chunk_text,
        )

        self.db.add(chunk)
        self.db.commit()
        self.db.refresh(chunk)

        return chunk

    # Get Chunks By Uploaded File
    def get_by_uploaded_file(
        self,
        uploaded_file_id: int,
    ):

        query = (
            select(DocumentChunk)
            .where(
                DocumentChunk.uploaded_file_id == uploaded_file_id
            )
            .order_by(
                DocumentChunk.chunk_index
            )
        )

        return self.db.execute(query).scalars().all()

    # Delete Chunks
    def delete_by_uploaded_file(
        self,
        uploaded_file_id: int,
    ):

        chunks = self.get_by_uploaded_file(
            uploaded_file_id
        )

        for chunk in chunks:
            self.db.delete(chunk)

        self.db.commit()