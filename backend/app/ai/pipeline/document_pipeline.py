from sqlalchemy.orm import Session

from app.ai.extractors.pdf_extractor import PDFExtractor
from app.ai.cleaners.text_cleaner import TextCleaner
from app.services.document_chunk import DocumentChunkService


class DocumentPipeline:

    def __init__(
        self,
        db: Session,
    ):
        self.extractor = PDFExtractor()
        self.cleaner = TextCleaner()
        self.chunk_service = DocumentChunkService(db)

    # Process uploaded document
    def process_document(
        self,
        uploaded_file_id: int,
        file_path: str,
    ):

        # Extract Text
        raw_text = self.extractor.extract_text(
            file_path,
        )

        # Clean Text
        clean_text = self.cleaner.clean(
            raw_text,
        )

        # Store Chunks
        chunks = self.chunk_service.create_chunks(
            uploaded_file_id,
            clean_text,
        )

        return chunks