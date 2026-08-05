import re
import os
from typing import Any
from datetime import datetime
from sqlalchemy.orm import Session
from youtube_transcript_api import YouTubeTranscriptApi

from app.models.lesson import Lesson
from app.models.lesson_resource import LessonResource
from app.models.resource_cache import ResourceCache
from app.ai.extractors.pdf_extractor import PDFExtractor


class ResourceExtractorService:

    def __init__(self, db: Session):
        self.db = db
        self.pdf_extractor = PDFExtractor()

    def extract_youtube_video_id(self, url: str) -> str | None:
        """Extract 11-character YouTube video ID from various URL formats."""
        if not url:
            return None
        pattern = r"(?:v=|\/([0-9A-Za-z_-]{11})|youtu\.be\/)([0-9A-Za-z_-]{11})"
        match = re.search(pattern, url)
        if match:
            return match.group(1) or match.group(2)
        return None

    def get_resource_cache(self, resource_key: str) -> ResourceCache | None:
        return (
            self.db.query(ResourceCache)
            .filter(ResourceCache.resource_id == resource_key)
            .first()
        )

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

    def discover_lesson_resources(self, lesson_id: int) -> dict[str, Any]:
        """Discover all attached resources (PDFs, YouTube videos, Notes, Description) for a lesson."""
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

        has_pdf = False
        has_youtube = False

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

        # Calculate estimated duration (approx 500 words per second LLM processing + 10s base)
        estimated_duration = max(15, min(90, 10 + (total_words // 400)))

        return {
            "resources": resources_list,
            "total_words": total_words,
            "estimated_duration_sec": estimated_duration,
            "has_pdf": has_pdf,
            "has_youtube": has_youtube,
        }
