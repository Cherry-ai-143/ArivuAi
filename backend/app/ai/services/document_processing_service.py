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

    # purpose : Extract PDF pages with metadata, split text into chunks, and store DocumentChunk records with page_number and chapter_title.
    def process_pdf(
        self,
        uploaded_file,
    ):

        # purpose : Resolve the actual filesystem path from file_url (which may have a leading slash).
        #           file_url is stored as '/uploads/<uuid>.pdf' for web serving, but the real file
        #           lives at 'uploads/<uuid>.pdf' relative to the backend working directory.
        resolved_path = self.extractor.resolve_path(uploaded_file.file_url)

        # Extract page-by-page metadata from PDF
        pages_data = self.extractor.extract_pages_with_metadata(
            resolved_path
        )

        global_chunk_index = 0

        # Save chunks with page number and chapter title metadata
        for page_item in pages_data:
            page_num = page_item.get("page_number")
            c_title = page_item.get("chapter_title")
            raw_p_text = page_item.get("text", "")

            clean_text = self.cleaner.clean(raw_p_text)
            if not clean_text or not clean_text.strip():
                continue

            chunks = self.chunker.split_text(clean_text)

            for chunk in chunks:
                # Save chunk in PostgreSQL with chapter & page metadata
                document_chunk = self.chunk_repository.create(
                    uploaded_file_id=uploaded_file.id,
                    chunk_index=global_chunk_index,
                    chunk_text=chunk,
                    page_number=page_num,
                    chapter_title=c_title,
                )

                # Store embedding in ChromaDB
                try:
                    self.chroma.add_document(
                        document_id=str(document_chunk.id),
                        text=chunk,
                        metadata={
                            "uploaded_file_id": uploaded_file.id,
                            "lesson_id": uploaded_file.lesson_id,
                            "chunk_index": global_chunk_index,
                            "page_number": page_num,
                            "chapter_title": c_title or "",
                        },
                    )
                except Exception as e:
                    print(f"ChromaDB storage warning for chunk {global_chunk_index}: {e}")

                global_chunk_index += 1

        return global_chunk_index