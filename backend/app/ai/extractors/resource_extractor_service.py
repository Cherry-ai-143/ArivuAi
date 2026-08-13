import re
import os
from typing import Any
from datetime import datetime
from sqlalchemy.orm import Session
from youtube_transcript_api import YouTubeTranscriptApi

from app.models.lesson import Lesson
from app.models.lesson_resource import LessonResource
from app.models.resource_cache import ResourceCache
from app.models.uploaded_file import UploadedFile
from app.models.document_chunk import DocumentChunk
from app.ai.extractors.pdf_extractor import PDFExtractor


class ResourceExtractorService:

    def __init__(self, db: Session):
        self.db = db
        self.pdf_extractor = PDFExtractor()

    # purpose : Extract 11-character YouTube video ID from various URL formats.
    def extract_youtube_video_id(self, url: str) -> str | None:
        if not url:
            return None
        pattern = r"(?:v=|\/([0-9A-Za-z_-]{11})|youtu\.be\/)([0-9A-Za-z_-]{11})"
        match = re.search(pattern, url)
        if match:
            return match.group(1) or match.group(2)
        return None

    # purpose : Retrieve cached extracted resource text from resource_cache table.
    def get_resource_cache(self, resource_key: str) -> ResourceCache | None:
        return (
            self.db.query(ResourceCache)
            .filter(ResourceCache.resource_id == resource_key)
            .first()
        )

    # purpose : Extract PDF content and cache text in database.
    def extract_pdf_resource(self, resource: LessonResource) -> dict[str, Any]:
        resource_key = f"pdf_{resource.id}"
        cache = self.get_resource_cache(resource_key)

        # Cache Invalidation check
        if cache and cache.resource_updated_at and resource.created_at:
            if cache.resource_updated_at >= resource.created_at:
                return {
                    "text": cache.cached_text,
                    "word_count": cache.word_count,
                    "page_map": cache.page_timestamp_map or {},
                    "source_name": resource.title,
                }

        # Extract text from PDF file
        file_path = resource.file_path
        if not file_path or not os.path.exists(file_path):
            # Fallback path construct
            file_path = os.path.join("uploads", "lessons", f"lesson_{resource.lesson_id}", resource.title)

        if not os.path.exists(file_path):
            return {
                "text": f"PDF Resource: {resource.title}\n{resource.description or ''}",
                "word_count": len((resource.description or "").split()),
                "page_map": {},
                "source_name": resource.title,
            }

        extracted_raw = self.pdf_extractor.extract_text(file_path)
        word_count = len(extracted_raw.split())

        # Save to Cache
        if cache:
            cache.cached_text = extracted_raw
            cache.word_count = word_count
            cache.resource_updated_at = datetime.utcnow()
        else:
            cache = ResourceCache(
                resource_id=resource_key,
                resource_type="PDF",
                cached_text=extracted_raw,
                word_count=word_count,
                resource_updated_at=datetime.utcnow(),
            )
            self.db.add(cache)

        self.db.commit()

        return {
            "text": extracted_raw,
            "word_count": word_count,
            "page_map": {},
            "source_name": resource.title,
        }

    # purpose : Extract YouTube video transcripts using YouTubeTranscriptApi and cache result.
    def extract_youtube_resource(self, resource: LessonResource) -> dict[str, Any]:
        resource_key = f"youtube_{resource.id}"
        cache = self.get_resource_cache(resource_key)

        if cache and cache.resource_updated_at and resource.created_at:
            if cache.resource_updated_at >= resource.created_at:
                return {
                    "text": cache.cached_text,
                    "word_count": cache.word_count,
                    "timestamp_map": cache.page_timestamp_map or {},
                    "source_name": resource.title,
                }

        video_id = self.extract_youtube_video_id(resource.url or "")
        transcript_text = ""
        timestamp_map = {}

        if video_id:
            try:
                try:
                    ytt = YouTubeTranscriptApi()
                    transcript_list = ytt.fetch(video_id)
                except Exception:
                    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)

                lines = []
                for entry in transcript_list:
                    if hasattr(entry, "start"):
                        start_sec = int(getattr(entry, "start", 0))
                        text_line = getattr(entry, "text", "")
                    elif isinstance(entry, dict):
                        start_sec = int(entry.get("start", 0))
                        text_line = entry.get("text", "")
                    else:
                        continue

                    mm = start_sec // 60
                    ss = start_sec % 60
                    time_tag = f"[{mm:02d}:{ss:02d}]"
                    lines.append(f"{time_tag} {text_line}")
                transcript_text = "\n".join(lines)
            except Exception as e:
                print(f"Transcript unavailable for video {video_id}: {e}")
                transcript_text = f"YouTube Lecture: {resource.title}\n{resource.description or ''}"
        else:
            transcript_text = f"YouTube Lecture: {resource.title}\n{resource.description or ''}"

        word_count = len(transcript_text.split())

        if cache:
            cache.cached_text = transcript_text
            cache.word_count = word_count
            cache.resource_updated_at = datetime.utcnow()
        else:
            cache = ResourceCache(
                resource_id=resource_key,
                resource_type="YOUTUBE",
                cached_text=transcript_text,
                word_count=word_count,
                resource_updated_at=datetime.utcnow(),
            )
            self.db.add(cache)

        self.db.commit()

        return {
            "text": transcript_text,
            "word_count": word_count,
            "timestamp_map": timestamp_map,
            "source_name": resource.title,
        }

    # purpose : Discover attached lesson resources and course-level textbook PDFs with chapter breakdowns.
    def discover_lesson_resources(self, lesson_id: int) -> dict[str, Any]:
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return {
                "resources": [],
                "total_words": 0,
                "estimated_duration_sec": 0,
                "has_pdf": False,
                "has_youtube": False,
            }

        resources_list = []
        total_words = 0
        has_pdf = False
        has_youtube = False

        # 1. Lesson Description
        if lesson.description and lesson.description.strip():
            desc_words = len(lesson.description.split())
            resources_list.append({
                "id": f"desc_{lesson.id}",
                "type": "Lesson Description",
                "title": f"Lesson Overview & Description",
                "word_count": desc_words,
                "detail": f"{desc_words} words",
                "enabled_by_default": True,
            })
            total_words += desc_words

        # 2. Attached LessonResources
        attached_resources = getattr(lesson, "resources", []) or []

        for r in attached_resources:
            rtype = r.resource_type.upper()
            if "PDF" in rtype:
                has_pdf = True
                data = self.extract_pdf_resource(r)
                resources_list.append({
                    "id": f"resource_{r.id}",
                    "db_id": r.id,
                    "type": "PDF Document",
                    "title": r.title,
                    "word_count": data["word_count"],
                    "detail": f"{data['word_count']} words",
                    "enabled_by_default": True,
                })
                total_words += data["word_count"]
            elif "YOUTUBE" in rtype:
                has_youtube = True
                data = self.extract_youtube_resource(r)
                resources_list.append({
                    "id": f"resource_{r.id}",
                    "db_id": r.id,
                    "type": "YouTube Transcript",
                    "title": r.title,
                    "word_count": data["word_count"],
                    "detail": f"{data['word_count']} words transcript",
                    "enabled_by_default": True,
                })
                total_words += data["word_count"]
            elif "NOTE" in rtype:
                nwords = len((r.description or r.title).split())
                resources_list.append({
                    "id": f"resource_{r.id}",
                    "db_id": r.id,
                    "type": "Lesson Notes",
                    "title": r.title,
                    "word_count": nwords,
                    "detail": f"{nwords} words",
                    "enabled_by_default": True,
                })
                total_words += nwords

        # 3. Course-level and Lesson-level UploadedFile PDF Textbooks
        course_id = lesson.chapter.course_id if (lesson.chapter and lesson.chapter.course_id) else None
        uploaded_files_query = self.db.query(UploadedFile)
        if course_id:
            uploaded_files = uploaded_files_query.filter(
                (UploadedFile.course_id == course_id) | (UploadedFile.lesson_id == lesson_id)
            ).all()
        else:
            uploaded_files = uploaded_files_query.filter(UploadedFile.lesson_id == lesson_id).all()

        for ufile in uploaded_files:
            if not ufile.original_filename.lower().endswith(".pdf") and "pdf" not in ufile.mime_type.lower():
                continue

            has_pdf = True

            # Retrieve or process document_chunks
            chunks = self.db.query(DocumentChunk).filter(DocumentChunk.uploaded_file_id == ufile.id).order_by(DocumentChunk.chunk_index.asc()).all()
            # Check if stored chunks cover the complete PDF file
            resolved_file_path = self.pdf_extractor.resolve_path(ufile.file_url)
            if chunks and resolved_file_path and os.path.exists(resolved_file_path):
                try:
                    import fitz
                    pdf_doc = fitz.open(resolved_file_path)
                    total_pdf_page_count = len(pdf_doc)
                    pdf_doc.close()
                    max_stored_page = max((c.page_number or 1) for c in chunks)
                    if max_stored_page < total_pdf_page_count - 5:
                        self.db.query(DocumentChunk).filter(DocumentChunk.uploaded_file_id == ufile.id).delete()
                        self.db.commit()
                        chunks = []
                except Exception as ex:
                    print(f"Error checking PDF page bounds: {ex}")

            if not chunks and ufile.file_url and os.path.exists(resolved_file_path):
                try:
                    from app.ai.services.document_processing_service import DocumentProcessingService
                    processor = DocumentProcessingService(self.db)
                    processor.process_pdf(ufile)
                    chunks = self.db.query(DocumentChunk).filter(DocumentChunk.uploaded_file_id == ufile.id).order_by(DocumentChunk.chunk_index.asc()).all()
                except Exception as ex:
                    print(f"Error auto-processing PDF file {ufile.id}: {ex}")

            # Aggregate chapter structure from document_chunks
            KNOWN_TITLE_MAP = {
                "Chapter 4: Carbon and its": "Chapter 4: Carbon and its Compounds",
                "Chapter 7: Control and": "Chapter 7: Control and Coordination",
                "Chapter 8: How do Organisms": "Chapter 8: How do Organisms Reproduce?",
                "Chapter 9: Heredity and": "Chapter 9: Heredity and Evolution",
                "Chapter 10: Light - Reflection and": "Chapter 10: Light - Reflection and Refraction",
                "Chapter 11: The Human Eye and": "Chapter 11: The Human Eye and the Colourful World",
                "Chapter 13: Magnetic Effects of": "Chapter 13: Magnetic Effects of Electric Current",
                "Chapter 14: Sources of": "Chapter 14: Sources of Energy",
                "Chapter 16: Management of": "Chapter 16: Management of Natural Resources",
            }

            chapter_groups: dict[str, dict[str, Any]] = {}
            max_page = 1
            total_pdf_words = 0

            for chunk in chunks:
                w_count = len((chunk.chunk_text or "").split())
                total_pdf_words += w_count
                p_num = chunk.page_number or 1
                if p_num > max_page:
                    max_page = p_num

                raw_c_name = chunk.chapter_title or "General Content"
                # Filter out false positive answer-key headings in back appendix pages
                if re.search(r'Chapter \d+:\s*\d+\.\s*\(', raw_c_name):
                    raw_c_name = "General Content"

                c_name = KNOWN_TITLE_MAP.get(raw_c_name, raw_c_name)

                if c_name not in chapter_groups:
                    chapter_groups[c_name] = {
                        "title": c_name,
                        "start_page": p_num,
                        "end_page": p_num,
                        "chunk_count": 0,
                        "word_count": 0,
                    }

                ch_info = chapter_groups[c_name]
                ch_info["chunk_count"] += 1
                ch_info["word_count"] += w_count
                if p_num < ch_info["start_page"]:
                    ch_info["start_page"] = p_num
                if p_num > ch_info["end_page"]:
                    ch_info["end_page"] = p_num

            # Remove 'General Content' if real chapters exist and General Content is tiny or empty
            chapters_list = [c for c in chapter_groups.values() if c["title"] != "General Content"]
            if not chapters_list:
                chapters_list = list(chapter_groups.values())

            if not chapters_list and chunks:
                chapters_list = [{
                    "title": "Entire Document",
                    "start_page": 1,
                    "end_page": max_page,
                    "chunk_count": len(chunks),
                    "word_count": total_pdf_words,
                }]

            resources_list.append({
                "id": f"pdf_{ufile.id}",
                "pdf_id": ufile.id,
                "db_id": ufile.id,
                "type": "Course Textbook PDF" if ufile.course_id else "Lesson PDF Document",
                "title": ufile.title or ufile.original_filename,
                "filename": ufile.original_filename,
                "total_pages": max_page,
                "word_count": total_pdf_words,
                "detail": f"{max_page} pages · {len(chapters_list)} chapters",
                "chapters": chapters_list,
                "enabled_by_default": False if has_youtube else True,
            })
            total_words += total_pdf_words

        estimated_duration = max(15, min(90, 10 + (total_words // 400)))

        return {
            "resources": resources_list,
            "total_words": total_words,
            "estimated_duration_sec": estimated_duration,
            "has_pdf": has_pdf,
            "has_youtube": has_youtube,
        }
