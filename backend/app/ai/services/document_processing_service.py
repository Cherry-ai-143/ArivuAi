from sqlalchemy.orm import Session

from app.ai.extractors.pdf_extractor import PDFExtractor
from app.ai.cleaners.text_cleaner import TextCleaner
from app.ai.chunkers.text_chunker import TextChunker
from app.ai.vectorstore.chroma_service import ChromaService

from app.repositories.document_chunk import DocumentChunkRepository


class DocumentProcessingService:

    def __init__(
        self,
        db: Session,
    ):

        self.db = db

        self.extractor = PDFExtractor()

        self.cleaner = TextCleaner()

        self.chunker = TextChunker()

        self.chroma = ChromaService()

        self.chunk_repository = DocumentChunkRepository(
            db
        )

    # Process Uploaded PDF
    def process_pdf(
        self,
        uploaded_file,
    ):

        # Extract text from PDF
        raw_text = self.extractor.extract_text(
            uploaded_file.file_url
        )

        # Clean extracted text
        clean_text = self.cleaner.clean(
            raw_text
        )

        # Split text into chunks
        chunks = self.chunker.split_text(
            clean_text
        )

        # Save chunks and store embeddings in ChromaDB
        for index, chunk in enumerate(chunks):

            # Save chunk in PostgreSQL
            document_chunk = self.chunk_repository.create(
                uploaded_file_id=uploaded_file.id,
                chunk_index=index,
                chunk_text=chunk,
            )

            # Store embedding in ChromaDB
            self.chroma.add_document(
                document_id=str(document_chunk.id),
                text=chunk,
                metadata={
                    "uploaded_file_id": uploaded_file.id,
                    "lesson_id": uploaded_file.lesson_id,
                    "chunk_index": index,
                },
            )

        return len(chunks)