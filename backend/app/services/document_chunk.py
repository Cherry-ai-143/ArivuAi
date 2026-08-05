from sqlalchemy.orm import Session

from app.ai.chunkers.text_chunker import TextChunker
from app.repositories.document_chunk import (
    DocumentChunkRepository,
)
from app.schemas.document_chunk import (
    DocumentChunkCreate,
)


class DocumentChunkService:

    def __init__(
        self,
        db: Session,
    ):
        self.repository = DocumentChunkRepository(db)
        self.chunker = TextChunker()

    # Create chunks
    def create_chunks(
        self,
        uploaded_file_id: int,
        text: str,
    ):

        chunks = self.chunker.split_text(text)

        created_chunks = []

        for index, chunk in enumerate(chunks):

            chunk_data = DocumentChunkCreate(
                uploaded_file_id=uploaded_file_id,
                chunk_index=index,
                chunk_text=chunk,
            )

            created_chunk = self.repository.create(
                chunk_data,
            )

            created_chunks.append(
                created_chunk,
            )

        return created_chunks