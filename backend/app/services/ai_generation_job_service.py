import math
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.ai_generation_job import AIGenerationJob
from app.models.ai_generation_question import AIGenerationQuestion
from app.models.ai_generation_chunk import AIGenerationChunk
from app.models.ai_generation_log import AIGenerationLog

from app.models.question import Question, QuestionType
from app.models.lesson import Lesson
from app.models.lesson_resource import LessonResource
from app.models.uploaded_file import UploadedFile
from app.models.document_chunk import DocumentChunk

from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.extractors.resource_extractor_service import ResourceExtractorService
from app.ai.pipeline.quality_validator import QualityValidator
from app.ai.pipeline.token_chunker import TokenChunker


class AIGenerationJobService:

    def __init__(self, db: Session):
        self.db = db
        self.provider = GeminiProvider()
        self.extractor = ResourceExtractorService(db)
        self.validator = QualityValidator(db)
        self.token_chunker = TokenChunker(
            target_tokens=4000,
            overlap_tokens=250,
        )

    # ==========================================================
    # Question Type Normalization
    # ==========================================================

    @staticmethod
    def normalize_question_type(
        value: str | QuestionType | None,
    ) -> QuestionType:
        """
        Convert every possible question type representation into
        the SQLAlchemy QuestionType enum.

        IMPORTANT:
        PostgreSQL stores MULTIPLE_CHOICE as MCQ.

        Therefore:

            MULTIPLE_CHOICE -> QuestionType.MULTIPLE_CHOICE -> "MCQ"
            MCQ             -> QuestionType.MULTIPLE_CHOICE -> "MCQ"
            TRUE_FALSE      -> QuestionType.TRUE_FALSE      -> "TRUE_FALSE"
            FILL_BLANK      -> QuestionType.FILL_BLANK      -> "FILL_BLANK"
        """

        if isinstance(value, QuestionType):
            return value

        clean_type = (
            value or "MULTIPLE_CHOICE"
).strip().upper()

        clean_type = (
            clean_type
            .replace(" ", "_")
            .replace("-", "_")
            .replace("/", "_")
        )

        # ------------------------------------------------------
        # Multiple Choice
        # ------------------------------------------------------

        if clean_type in {
            "MULTIPLE_CHOICE",
            "MULTIPLECHOICE",
            "MCQ",
            "QUESTIONTYPE.MULTIPLE_CHOICE",
        }:
            return QuestionType.MULTIPLE_CHOICE

        # ------------------------------------------------------
        # True / False
        # ------------------------------------------------------

        if clean_type in {
            "TRUE_FALSE",
            "TRUEFALSE",
            "TRUE_OR_FALSE",
            "QUESTIONTYPE.TRUE_FALSE",
        }:
            return QuestionType.TRUE_FALSE

        # ------------------------------------------------------
        # Fill in the Blank
        # ------------------------------------------------------

        if clean_type in {
            "FILL_BLANK",
            "FILL_IN_THE_BLANK",
            "FILL_IN_THE_BLANKS",
            "FILLINBLANK",
            "FILLINBLANKS",
            "QUESTIONTYPE.FILL_BLANK",
        }:
            return QuestionType.FILL_BLANK

        # ------------------------------------------------------
        # Other supported enum types
        # ------------------------------------------------------

        if clean_type == "SHORT_ANSWER":
            return QuestionType.SHORT_ANSWER

        if clean_type == "MATCHING":
            return QuestionType.MATCHING

        if clean_type == "ORDERING":
            return QuestionType.ORDERING

        if clean_type == "MIXED":
            return QuestionType.MIXED

        # ------------------------------------------------------
        # Safe fallback
        # ------------------------------------------------------

        return QuestionType.MULTIPLE_CHOICE

    # ==========================================================
    # Audit Logging
    # ==========================================================

    def log_event(
        self,
        job_id: str,
        stage: str,
        message: str,
        severity: str = "INFO",
    ):
        """
        Insert structured audit event into ai_generation_logs.
        """

        log = AIGenerationLog(
            job_id=job_id,
            severity=severity,
            stage=stage,
            message=message,
        )

        self.db.add(log)
        self.db.commit()

    # ==========================================================
    # Create Job
    # ==========================================================

    def create_job(
        self,
        lesson_id: int,
        teacher_id: int,
        configuration: dict[str, Any],
    ) -> AIGenerationJob:

        job_id = f"job_{uuid.uuid4().hex[:12]}"

        discovery = self.extractor.discover_lesson_resources(
            lesson_id
        )

        total_words = discovery["total_words"]
        estimated_duration = discovery["estimated_duration_sec"]

        job = AIGenerationJob(
            job_id=job_id,
            lesson_id=lesson_id,
            teacher_id=teacher_id,
            status="QUEUED",
            current_stage="EXTRACTING",
            progress_pct=5,
            progress_message="Job enqueued in background pipeline...",
            configuration=configuration,
            total_words=total_words,
            estimated_duration_sec=estimated_duration,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=7),
        )

        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)

        self.log_event(
            job_id,
            "QUEUED",
            "Job enqueued in background queue",
            "INFO",
        )

        return job

    # ==========================================================
    # Execute Job
    # ==========================================================

    def execute_job_sync(self, job_id: str):
        """
        Execute AI generation workflow.
        """

        job = (
            self.db.query(AIGenerationJob)
            .filter(
                AIGenerationJob.job_id == job_id
            )
            .first()
        )

        if not job:
            return

        # ------------------------------------------------------
        # Idempotent worker lock
        # ------------------------------------------------------

        if job.is_locked:
            return

        job.is_locked = True
        job.status = "RUNNING"
        self.db.commit()

        start_time = time.time()

        try:

            # ==================================================
            # STAGE 1: EXTRACTING
            # ==================================================

            job.current_stage = "EXTRACTING"
            job.progress_pct = 10
            job.progress_message = (
                "Reading lesson resources & attached materials..."
            )

            self.db.commit()

            self.log_event(
                job_id,
                "EXTRACTING",
                "Extracting lesson content and uploaded files",
                "INFO",
            )

            lesson_id = job.lesson_id

            lesson = (
                self.db.query(Lesson)
                .filter(Lesson.id == lesson_id)
                .first()
            )

            if not lesson:
                raise ValueError("Lesson not found.")

            config = job.configuration or {}

            selected_resource_ids = config.get(
                "selected_resource_ids",
                [],
            )

            selected_pdf_id = config.get(
                "selected_pdf_id"
            )

            selected_chapter_title = config.get(
                "selected_chapter_title"
            )

            start_page = config.get(
                "start_page"
            )

            end_page = config.get(
                "end_page"
            )

            merged_text_parts: list[str] = []

            # --------------------------------------------------
            # Lesson description
            # --------------------------------------------------

            if (
                config.get(
                    "include_description",
                    True,
                )
                and lesson.description
            ):
                merged_text_parts.append(
                    f"LESSON OVERVIEW:\n{lesson.description}"
                )

            # --------------------------------------------------
            # Attached resources
            # --------------------------------------------------

            attached_resources = (
                self.db.query(LessonResource)
                .filter(
                    LessonResource.lesson_id
                    == lesson_id
                )
                .all()
            )

            for resource in attached_resources:

                resource_key = (
                    f"resource_{resource.id}"
                )

                if (
                    selected_resource_ids
                    and resource_key
                    not in selected_resource_ids
                ):
                    continue

                resource_type = (
                    resource.resource_type or ""
                ).upper()

                if "PDF" in resource_type:

                    data = (
                        self.extractor
                        .extract_pdf_resource(resource)
                    )

                    merged_text_parts.append(
                        f"PDF DOCUMENT "
                        f"[{resource.title}]:\n"
                        f"{data['text']}"
                    )

                elif "YOUTUBE" in resource_type:

                    data = (
                        self.extractor
                        .extract_youtube_resource(resource)
                    )

                    merged_text_parts.append(
                        f"YOUTUBE LECTURE TRANSCRIPT "
                        f"[{resource.title}]:\n"
                        f"{data['text']}"
                    )

                elif "NOTE" in resource_type:

                    merged_text_parts.append(
                        f"LESSON NOTES "
                        f"[{resource.title}]:\n"
                        f"{resource.description or resource.title}"
                    )

            # --------------------------------------------------
            # Textbook PDF chunks
            # --------------------------------------------------

            target_pdf_id = selected_pdf_id

            if (
                not target_pdf_id
                and selected_resource_ids
            ):

                for resource_id in selected_resource_ids:

                    if str(resource_id).startswith("pdf_"):

                        try:
                            target_pdf_id = int(
                                str(resource_id)
                                .replace("pdf_", "")
                            )
                            break

                        except ValueError:
                            pass

            if target_pdf_id:

                chunk_query = (
                    self.db.query(DocumentChunk)
                    .filter(
                        DocumentChunk.uploaded_file_id
                        == target_pdf_id
                    )
                )

                if (
                    selected_chapter_title
                    and selected_chapter_title
                    not in [
                        "Entire Textbook",
                        "Entire Document",
                        "All Chapters",
                    ]
                ):
                    chunk_query = chunk_query.filter(
                        DocumentChunk.chapter_title
                        == selected_chapter_title
                    )

                if (
                    start_page is not None
                    and end_page is not None
                    and start_page > 0
                    and end_page >= start_page
                ):

                    chunk_query = chunk_query.filter(
                        DocumentChunk.page_number
                        >= start_page,
                        DocumentChunk.page_number
                        <= end_page,
                    )

                target_chunks = (
                    chunk_query
                    .order_by(
                        DocumentChunk.chunk_index.asc()
                    )
                    .all()
                )

                if target_chunks:

                    pdf_text = "\n\n".join(
                        [
                            chunk.chunk_text
                            for chunk in target_chunks
                            if chunk.chunk_text
                        ]
                    )

                    ufile = (
                        self.db.query(UploadedFile)
                        .filter(
                            UploadedFile.id
                            == target_pdf_id
                        )
                        .first()
                    )

                    if ufile:
                        pdf_title = (
                            ufile.title
                            or ufile.original_filename
                        )
                    else:
                        pdf_title = (
                            f"PDF #{target_pdf_id}"
                        )

                    if selected_chapter_title:
                        scope_info = (
                            f"Chapter: "
                            f"{selected_chapter_title}"
                        )
                    elif start_page:
                        scope_info = (
                            f"Pages "
                            f"{start_page}-{end_page}"
                        )
                    else:
                        scope_info = (
                            "Entire Resource"
                        )

                    merged_text_parts.append(
                        f"TEXTBOOK SOURCE "
                        f"[{pdf_title} - {scope_info}]:\n"
                        f"{pdf_text}"
                    )

                    self.log_event(
                        job_id,
                        "EXTRACTING",
                        (
                            f"Retrieved "
                            f"{len(target_chunks)} chunks "
                            f"from PDF #{target_pdf_id} "
                            f"(Scope: {scope_info})"
                        ),
                        "INFO",
                    )

            # --------------------------------------------------
            # Final context
            # --------------------------------------------------

            context_text = "\n\n".join(
                merged_text_parts
            )

            if not context_text.strip():

                context_text = (
                    f"Lesson Title: "
                    f"{lesson.title}\n"
                    f"{lesson.description or ''}"
                )

            # ==================================================
            # STAGE 2: CACHING
            # ==================================================

            job.current_stage = "CACHING"
            job.progress_pct = 20
            job.progress_message = (
                "Verifying resource text cache..."
            )

            self.db.commit()

            self.log_event(
                job_id,
                "CACHING",
                "Context cached in database for fast retries",
                "SUCCESS",
            )

            # ==================================================
            # STAGE 3: CHUNKING
            # ==================================================

            job.current_stage = "CHUNKING"
            job.progress_pct = 30
            job.progress_message = (
                "Chunking content with 250-token overlap..."
            )

            self.db.commit()

            chunks_data = (
                self.token_chunker
                .chunk_context(context_text)
            )

            job.total_chunks = len(
                chunks_data
            )

            self.db.commit()

            self.log_event(
                job_id,
                "CHUNKING",
                (
                    f"Content split into "
                    f"{len(chunks_data)} "
                    f"token-bounded chunks"
                ),
                "INFO",
            )

            # ==================================================
            # Generation Configuration
            # ==================================================

            num_questions = config.get(
                "num_questions",
                10,
            )

            difficulty_dist = config.get(
                "difficulty_dist",
                "Medium",
            )

            type_dist = config.get(
                "type_dist",
                "Multiple Choice",
            )

            bloom_level = config.get(
                "bloom_level",
                "Understanding",
            )

            if not chunks_data:
                raise ValueError(
                    "No content chunks available for generation."
                )

            # ==================================================
            # STAGE 4: GENERATING
            # ==================================================

            job.current_stage = "GENERATING"
            self.db.commit()

            existing_candidate_texts = [
                q.question_text
                for q in (
                    self.db.query(
                        AIGenerationQuestion
                    )
                    .filter(
                        AIGenerationQuestion.job_id
                        == job_id
                    )
                    .all()
                )
            ]

            qs_per_chunk = max(
                2,
                math.ceil(
                    num_questions
                    / len(chunks_data)
                ),
            )

            for c_info in chunks_data:

                c_num = c_info["chunk_number"]

                current_valid_count = len(
                    existing_candidate_texts
                )

                qs_remaining = (
                    num_questions
                    - current_valid_count
                )

                if qs_remaining <= 0:

                    self.log_event(
                        job_id,
                        "GENERATING",
                        (
                            f"Target question count "
                            f"({num_questions}) reached."
                        ),
                        "INFO",
                    )

                    break

                qs_to_request = max(
                    1,
                    min(
                        qs_per_chunk,
                        qs_remaining,
                    ),
                )

                job.current_chunk = c_num

                job.progress_pct = (
                    30
                    + int(
                        (
                            c_num
                            / len(chunks_data)
                        )
                        * 55
                    )
                )

                job.progress_message = (
                    f"Chunk {c_num} of "
                    f"{len(chunks_data)} · "
                    f"Generating questions "
                    f"with Gemini AI..."
                )

                self.db.commit()

                # --------------------------------------------------
                # Resume existing chunk
                # --------------------------------------------------

                chunk_rec = (
                    self.db.query(
                        AIGenerationChunk
                    )
                    .filter(
                        AIGenerationChunk.job_id
                        == job_id,
                        AIGenerationChunk.chunk_number
                        == c_num,
                    )
                    .first()
                )

                if not chunk_rec:

                    chunk_rec = AIGenerationChunk(
                        job_id=job_id,
                        chunk_number=c_num,
                        status="RUNNING",
                        source_range=c_info[
                            "source_range"
                        ],
                        token_count=c_info[
                            "token_count"
                        ],
                        questions_requested=qs_to_request,
                        started_at=datetime.now(
                            timezone.utc
                        ),
                    )

                    self.db.add(chunk_rec)
                    self.db.commit()

                elif chunk_rec.status == "COMPLETED":

                    self.log_event(
                        job_id,
                        "GENERATING",
                        (
                            f"Chunk {c_num} "
                            f"already completed, skipping"
                        ),
                        "INFO",
                    )

                    continue

                chunk_rec.status = "RUNNING"
                self.db.commit()

                self.log_event(
                    job_id,
                    "GENERATING",
                    (
                        f"Executing Chunk "
                        f"{c_num} of "
                        f"{len(chunks_data)} "
                        f"({qs_to_request} Qs)"
                    ),
                    "INFO",
                )

                # --------------------------------------------------
                # Normalize requested type
                # --------------------------------------------------

                clean_type = (
                    str(
                        type_dist
                        or "MULTIPLE_CHOICE"
                    )
                    .upper()
                    .replace(" ", "_")
                    .replace("/", "_")
                    .replace("-", "_")
                )

                # ==================================================
                # Mixed Question Mode
                # ==================================================

                if clean_type in {
                    "MIXED",
                    "MIXED_MODE",
                }:

                    num_mcq = max(
                        1,
                        math.ceil(
                            qs_to_request * 0.5
                        ),
                    )

                    num_tf = max(
                        1,
                        math.floor(
                            qs_to_request * 0.3
                        ),
                    )

                    num_fill = max(
                        0,
                        qs_to_request
                        - (
                            num_mcq
                            + num_tf
                        ),
                    )

                    raw_qs = []

                    if num_mcq > 0:

                        raw_qs.extend(
                            self.provider.generate_questions(
                                context=c_info["text"],
                                num_questions=num_mcq,
                                difficulty_dist=difficulty_dist,
                                type_dist="MULTIPLE_CHOICE",
                                bloom_level=bloom_level,
                            )
                        )

                    if num_tf > 0:

                        raw_qs.extend(
                            self.provider.generate_questions(
                                context=c_info["text"],
                                num_questions=num_tf,
                                difficulty_dist=difficulty_dist,
                                type_dist="TRUE_FALSE",
                                bloom_level=bloom_level,
                            )
                        )

                    if num_fill > 0:

                        raw_qs.extend(
                            self.provider.generate_questions(
                                context=c_info["text"],
                                num_questions=num_fill,
                                difficulty_dist=difficulty_dist,
                                type_dist="FILL_BLANK",
                                bloom_level=bloom_level,
                            )
                        )

                # ==================================================
                # Single Question Type
                # ==================================================

                else:

                    raw_qs = (
                        self.provider
                        .generate_questions(
                            context=c_info["text"],
                            num_questions=qs_to_request,
                            difficulty_dist=difficulty_dist,
                            type_dist=clean_type,
                            bloom_level=bloom_level,
                        )
                    )

                chunk_rec.raw_response = str(
                    raw_qs
                )[:2000]

                dups_removed = 0
                generated_cnt = 0
                confidence_sum = 0

                import random

                # ==================================================
                # Process Generated Questions
                # ==================================================

                for raw_q in raw_qs:

                    q_text = raw_q.get(
                        "question_text",
                        "",
                    )

                    validation = (
                        self.validator
                        .validate_and_score_question(
                            raw_q,
                            lesson_id,
                            existing_candidate_texts,
                        )
                    )

                    if (
                        validation["rejected_reason"]
                        and "Duplicate"
                        in validation[
                            "rejected_reason"
                        ]
                    ):
                        dups_removed += 1

                    # --------------------------------------------------
                    # Normalize question type
                    # --------------------------------------------------

                    q_type_enum = (
                        self.normalize_question_type(
                            raw_q.get(
                                "question_type",
                                "MULTIPLE_CHOICE",
                            )
                        )
                    )

                    # --------------------------------------------------
                    # FILL BLANK
                    # --------------------------------------------------

                    if (
                        q_type_enum
                        == QuestionType.FILL_BLANK
                    ):

                        shuffled_opt_a = None
                        shuffled_opt_b = None
                        shuffled_opt_c = None
                        shuffled_opt_d = None

                        shuffled_correct_letter = None

                        c_answer = (
                            raw_q.get(
                                "correct_answer"
                            )
                            or raw_q.get(
                                "option_a",
                                "",
                            )
                        )

                    # --------------------------------------------------
                    # TRUE / FALSE
                    # --------------------------------------------------

                    elif (
                        q_type_enum
                        == QuestionType.TRUE_FALSE
                    ):

                        shuffled_opt_a = "True"
                        shuffled_opt_b = "False"
                        shuffled_opt_c = None
                        shuffled_opt_d = None

                        shuffled_correct_letter = (
                            str(
                                raw_q.get(
                                    "correct_option",
                                    "a",
                                )
                            )
                            .strip()
                            .lower()
                        )

                        if shuffled_correct_letter not in {
                            "a",
                            "b",
                        }:
                            shuffled_correct_letter = "a"

                        c_answer = None

                    # --------------------------------------------------
                    # MULTIPLE CHOICE
                    # --------------------------------------------------

                    else:

                        opt_a = raw_q.get(
                            "option_a",
                            "",
                        )

                        opt_b = raw_q.get(
                            "option_b",
                            "",
                        )

                        opt_c = raw_q.get(
                            "option_c",
                            "",
                        )

                        opt_d = raw_q.get(
                            "option_d",
                            "",
                        )

                        orig_correct = (
                            str(
                                raw_q.get(
                                    "correct_option",
                                    "a",
                                )
                            )
                            .strip()
                            .lower()
                        )

                        option_map = {
                            "a": opt_a,
                            "b": opt_b,
                            "c": opt_c,
                            "d": opt_d,
                        }

                        correct_text = option_map.get(
                            orig_correct,
                            opt_a,
                        )

                        opts = [
                            opt_a,
                            opt_b,
                            opt_c,
                            opt_d,
                        ]

                        random.shuffle(opts)

                        (
                            shuffled_opt_a,
                            shuffled_opt_b,
                            shuffled_opt_c,
                            shuffled_opt_d,
                        ) = opts

                        letters = [
                            "a",
                            "b",
                            "c",
                            "d",
                        ]

                        try:
                            shuffled_correct_letter = (
                                letters[
                                    opts.index(
                                        correct_text
                                    )
                                ]
                            )
                        except ValueError:
                            shuffled_correct_letter = "a"

                        c_answer = None

                    # ==================================================
                    # Candidate Question
                    # ==================================================

                    candidate_q = AIGenerationQuestion(
                        job_id=job_id,
                        question_text=q_text,
                        option_a=shuffled_opt_a,
                        option_b=shuffled_opt_b,
                        option_c=shuffled_opt_c,
                        option_d=shuffled_opt_d,
                        correct_option=shuffled_correct_letter,
                        correct_answer=c_answer,

                        # IMPORTANT:
                        # Store normalized enum VALUE for candidate
                        # table compatibility.
                        question_type=q_type_enum.value,

                        difficulty=validation.get(
                            "calibrated_difficulty",
                            raw_q.get(
                                "difficulty",
                                difficulty_dist,
                            ),
                        ),

                        bloom_level=raw_q.get(
                            "bloom_level",
                            bloom_level,
                        ),

                        explanation=raw_q.get(
                            "explanation",
                            "",
                        ),

                        source_attribution=c_info[
                            "source_range"
                        ],

                        ai_confidence=validation[
                            "score"
                        ],

                        approved=validation[
                            "approved"
                        ],

                        edited=False,

                        rejected_reason=validation[
                            "rejected_reason"
                        ],
                    )

                    self.db.add(candidate_q)

                    generated_cnt += 1

                    confidence_sum += (
                        validation["score"]
                    )

                    if validation["is_valid"]:
                        existing_candidate_texts.append(
                            q_text
                        )

                # ==================================================
                # Finish Chunk
                # ==================================================

                chunk_rec.status = "COMPLETED"

                chunk_rec.questions_generated = (
                    generated_cnt
                )

                chunk_rec.duplicates_removed = (
                    dups_removed
                )

                chunk_rec.confidence_avg = int(
                    confidence_sum
                    / max(
                        1,
                        generated_cnt,
                    )
                )

                chunk_rec.finished_at = (
                    datetime.now(timezone.utc)
                )

                self.db.commit()

                self.log_event(
                    job_id,
                    "GENERATING",
                    (
                        f"Chunk {c_num} completed "
                        f"({generated_cnt} Qs generated, "
                        f"{dups_removed} duplicates skipped)"
                    ),
                    "SUCCESS",
                )

            # ==================================================
            # STAGE 5: VALIDATING
            # ==================================================

            job.current_stage = "VALIDATING"
            job.progress_pct = 95
            job.progress_message = (
                "Finalizing question quality checks..."
            )

            self.db.commit()

            self.log_event(
                job_id,
                "VALIDATING",
                "Validation complete. Candidate items ready.",
                "SUCCESS",
            )

            # ==================================================
            # READY FOR REVIEW
            # ==================================================

            job.status = "READY_FOR_REVIEW"
            job.progress_pct = 100
            job.progress_message = (
                "Generation complete. Ready for review."
            )

            self.db.commit()

        except Exception as e:

            err_str = str(e)

            print(
                f"Error executing job "
                f"{job_id}: {err_str}"
            )

            job.status = "FAILED"

            if (
                "503" in err_str
                or "UNAVAILABLE" in err_str
                or "overloaded" in err_str
            ):

                job.failure_reason = (
                    "503 - Google Gemini AI "
                    "temporarily busy. "
                    "Please retry in 15 seconds."
                )

                job.progress_message = (
                    "AI service temporarily busy. "
                    "Gemini experiencing high demand."
                )

                self.log_event(
                    job_id,
                    "GENERATING",
                    "Gemini 503 Service Unavailable",
                    "ERROR",
                )

            elif (
                "429" in err_str
                or "RESOURCE_EXHAUSTED"
                in err_str
            ):

                job.failure_reason = (
                    "429 - Rate limit exceeded. "
                    "Please wait a moment."
                )

                job.progress_message = (
                    "Rate limit exceeded. "
                    "Retry in a few moments."
                )

                self.log_event(
                    job_id,
                    "GENERATING",
                    "Gemini 429 Rate Limit Exceeded",
                    "ERROR",
                )

            else:

                job.failure_reason = (
                    f"Generation Interrupted: "
                    f"{err_str}"
                )

                job.progress_message = (
                    f"Generation failed: "
                    f"{err_str}"
                )

                self.log_event(
                    job_id,
                    "GENERATING",
                    f"Pipeline Error: {err_str}",
                    "ERROR",
                )

            self.db.commit()

        finally:

            job.is_locked = False
            self.db.commit()

    # ==========================================================
    # Retry Job
    # ==========================================================

    def retry_job(
        self,
        job_id: str,
    ) -> AIGenerationJob | None:

        job = (
            self.db.query(AIGenerationJob)
            .filter(
                AIGenerationJob.job_id
                == job_id
            )
            .first()
        )

        if not job:
            return None

        job.status = "QUEUED"
        job.retry_count += 1
        job.failure_reason = None
        job.progress_pct = max(
            10,
            job.progress_pct,
        )

        job.progress_message = (
            f"Resuming generation job "
            f"(Retry #{job.retry_count})..."
        )

        self.db.commit()

        self.log_event(
            job_id,
            "QUEUED",
            (
                f"Job enqueued for retry "
                f"attempt #{job.retry_count}"
            ),
            "WARNING",
        )

        return job

    # ==========================================================
    # Job Status
    # ==========================================================

    def get_job_status(
        self,
        job_id: str,
    ) -> dict[str, Any]:

        job = (
            self.db.query(AIGenerationJob)
            .filter(
                AIGenerationJob.job_id
                == job_id
            )
            .first()
        )

        if not job:
            return {
                "found": False
            }

        questions = (
            self.db.query(
                AIGenerationQuestion
            )
            .filter(
                AIGenerationQuestion.job_id
                == job_id
            )
            .order_by(
                AIGenerationQuestion.id.asc()
            )
            .all()
        )

        logs = (
            self.db.query(
                AIGenerationLog
            )
            .filter(
                AIGenerationLog.job_id
                == job_id
            )
            .order_by(
                AIGenerationLog.created_at.asc()
            )
            .all()
        )

        elapsed_sec = 0

        if job.created_at:

            created_at = (
                job.created_at.replace(
                    tzinfo=None
                )
            )

            now = (
                datetime.now(timezone.utc)
                .replace(tzinfo=None)
            )

            elapsed_sec = int(
                (
                    now - created_at
                ).total_seconds()
            )

        return {
            "found": True,
            "job_id": job.job_id,
            "job_status": job.status,
            "stage": (
                job.current_stage
                or "EXTRACTING"
            ),
            "progress": job.progress_pct,
            "progress_message": job.progress_message,
            "failure_reason": job.failure_reason,
            "current_chunk": max(
                1,
                job.current_chunk,
            ),
            "total_chunks": max(
                1,
                job.total_chunks,
            ),
            "elapsed_time": (
                f"{elapsed_sec} sec"
            ),
            "estimated_remaining": (
                f"{max(5, job.estimated_duration_sec - elapsed_sec)} sec"
            ),
            "questions": questions,
            "timeline_logs": [
                {
                    "severity": log.severity,
                    "stage": log.stage,
                    "message": log.message,
                    "time": (
                        log.created_at.strftime(
                            "%H:%M:%S"
                        )
                        if log.created_at
                        else ""
                    ),
                }
                for log in logs
            ],
        }

    # ==========================================================
    # Generation History
    # ==========================================================

    def get_generation_history(
        self,
        lesson_id: int,
    ) -> list[dict[str, Any]]:

        jobs = (
            self.db.query(AIGenerationJob)
            .filter(
                AIGenerationJob.lesson_id
                == lesson_id
            )
            .order_by(
                AIGenerationJob.created_at.desc()
            )
            .limit(10)
            .all()
        )

        history = []

        for job in jobs:

            q_count = (
                self.db.query(
                    AIGenerationQuestion
                )
                .filter(
                    AIGenerationQuestion.job_id
                    == job.job_id
                )
                .count()
            )

            history.append(
                {
                    "job_id": job.job_id,
                    "status": job.status,
                    "current_stage": job.current_stage,
                    "progress_pct": job.progress_pct,
                    "question_count": q_count,
                    "created_at": (
                        job.created_at.isoformat()
                        if job.created_at
                        else None
                    ),
                    "configuration": job.configuration,
                }
            )

        return history

    # ==========================================================
    # Resource Preview
    # ==========================================================

    def get_resource_preview(
        self,
        lesson_id: int,
        resource_id: str,
    ) -> dict[str, Any]:

        if resource_id.startswith("pdf_"):

            try:

                ufile_id = int(
                    resource_id.replace(
                        "pdf_",
                        "",
                    )
                )

                chunks = (
                    self.db.query(
                        DocumentChunk
                    )
                    .filter(
                        DocumentChunk.uploaded_file_id
                        == ufile_id
                    )
                    .order_by(
                        DocumentChunk.chunk_index.asc()
                    )
                    .limit(5)
                    .all()
                )

                preview_text = "\n\n".join(
                    [
                        chunk.chunk_text
                        for chunk in chunks
                        if chunk.chunk_text
                    ]
                )

                return {
                    "resource_id": resource_id,
                    "preview_text": preview_text[
                        :2000
                    ],
                    "chunk_count": len(
                        chunks
                    ),
                }

            except Exception as ex:

                return {
                    "resource_id": resource_id,
                    "preview_text": "",
                    "error": str(ex),
                }

        return {
            "resource_id": resource_id,
            "preview_text": "",
        }

    # ==========================================================
    # Update Candidate Question
    # ==========================================================

    def update_candidate_question(
        self,
        temp_question_id: int,
        update_data: dict[str, Any],
    ) -> AIGenerationQuestion | None:

        temp_q = (
            self.db.query(
                AIGenerationQuestion
            )
            .filter(
                AIGenerationQuestion.id
                == temp_question_id
            )
            .first()
        )

        if not temp_q:
            return None

        if "approved" in update_data:

            temp_q.approved = bool(
                update_data["approved"]
            )

        if "question_text" in update_data:

            temp_q.question_text = (
                update_data["question_text"]
            )

            temp_q.edited = True

        if "option_a" in update_data:

            temp_q.option_a = (
                update_data["option_a"]
            )

            temp_q.edited = True

        if "option_b" in update_data:

            temp_q.option_b = (
                update_data["option_b"]
            )

            temp_q.edited = True

        if "option_c" in update_data:

            temp_q.option_c = (
                update_data["option_c"]
            )

            temp_q.edited = True

        if "option_d" in update_data:

            temp_q.option_d = (
                update_data["option_d"]
            )

            temp_q.edited = True

        if "correct_option" in update_data:

            temp_q.correct_option = (
                update_data["correct_option"]
            )

            temp_q.edited = True

        if "correct_answer" in update_data:

            temp_q.correct_answer = (
                update_data["correct_answer"]
            )

            temp_q.edited = True

        if "explanation" in update_data:

            temp_q.explanation = (
                update_data["explanation"]
            )

            temp_q.edited = True

        # ------------------------------------------------------
        # IMPORTANT:
        # If question_type is edited from frontend,
        # normalize it before storing.
        # ------------------------------------------------------

        if "question_type" in update_data:

            normalized_type = (
                self.normalize_question_type(
                    update_data["question_type"]
                )
            )

            # Store enum VALUE in candidate table
            temp_q.question_type = (
                normalized_type.value
            )

            temp_q.edited = True

        self.db.commit()
        self.db.refresh(temp_q)

        return temp_q

    # ==========================================================
    # Approve & Save Questions
    # ==========================================================

    def approve_and_save_questions(
        self,
        job_id: str,
        teacher_id: int,
    ) -> list[Question]:

        job = (
            self.db.query(AIGenerationJob)
            .filter(
                AIGenerationJob.job_id
                == job_id
            )
            .first()
        )

        if not job:
            return []

        approved_temp = (
            self.db.query(
                AIGenerationQuestion
            )
            .filter(
                AIGenerationQuestion.job_id
                == job_id,
                AIGenerationQuestion.approved
                == True,
            )
            .all()
        )

        saved_questions: list[Question] = []

        try:

            for temp_q in approved_temp:

                # ==================================================
                # CRITICAL FIX
                # ==================================================

                q_type_enum = (
                    self.normalize_question_type(
                        temp_q.question_type
                    )
                )

                # --------------------------------------------------
                # Debug information
                # --------------------------------------------------

                print(
                    "Saving question:",
                    temp_q.id,
                    "raw_type=",
                    temp_q.question_type,
                    "normalized_type=",
                    q_type_enum,
                    "db_value=",
                    q_type_enum.value,
                )

                # ==================================================
                # TRUE / FALSE SAFETY
                # ==================================================

                option_a = temp_q.option_a
                option_b = temp_q.option_b
                option_c = temp_q.option_c
                option_d = temp_q.option_d

                correct_option = (
                    temp_q.correct_option
                )

                correct_answer = (
                    temp_q.correct_answer
                )

                if (
                    q_type_enum
                    == QuestionType.TRUE_FALSE
                ):

                    option_a = "True"
                    option_b = "False"
                    option_c = None
                    option_d = None

                    if correct_option not in {
                        "a",
                        "b",
                    }:
                        correct_option = "a"

                    correct_answer = None

                # ==================================================
                # FILL BLANK SAFETY
                # ==================================================

                elif (
                    q_type_enum
                    == QuestionType.FILL_BLANK
                ):

                    option_a = None
                    option_b = None
                    option_c = None
                    option_d = None
                    correct_option = None

                    if not correct_answer:
                        correct_answer = (
                            temp_q.option_a
                            or ""
                        )

                # ==================================================
                # MULTIPLE CHOICE SAFETY
                # ==================================================

                elif (
                    q_type_enum
                    == QuestionType.MULTIPLE_CHOICE
                ):

                    # Ensure all four options exist.
                    if not all(
                        [
                            option_a,
                            option_b,
                            option_c,
                            option_d,
                        ]
                    ):
                        raise ValueError(
                            (
                                f"Question "
                                f"{temp_q.id} "
                                f"is MCQ but does not "
                                f"contain all four options."
                            )
                        )

                    if correct_option not in {
                        "a",
                        "b",
                        "c",
                        "d",
                    }:
                        raise ValueError(
                            (
                                f"Question "
                                f"{temp_q.id} "
                                f"has invalid "
                                f"correct_option: "
                                f"{correct_option}"
                            )
                        )

                    correct_answer = None

                # ==================================================
                # Create Final Question
                # ==================================================

                new_q = Question(
                    lesson_id=job.lesson_id,
                    question_text=temp_q.question_text,

                    option_a=option_a,
                    option_b=option_b,
                    option_c=option_c,
                    option_d=option_d,

                    correct_option=correct_option,
                    correct_answer=correct_answer,

                    marks=1,
                    order_number=1,

                    difficulty=temp_q.difficulty,

                    # IMPORTANT:
                    # Pass the actual Python Enum,
                    # NOT the string "MULTIPLE_CHOICE".
                    question_type=q_type_enum,

                    bloom_level=temp_q.bloom_level,

                    explanation=temp_q.explanation,

                    is_ai_generated=True,

                    ai_version="Gemini 2.5",

                    source_type="AI Generated",

                    source_attribution=(
                        temp_q.source_attribution
                    ),

                    ai_confidence=(
                        temp_q.ai_confidence
                    ),
                )

                self.db.add(new_q)

                saved_questions.append(new_q)

            # ------------------------------------------------------
            # Mark job completed
            # ------------------------------------------------------

            job.status = "COMPLETED"

            self.db.commit()

            # ------------------------------------------------------
            # Refresh saved questions
            # ------------------------------------------------------

            for question in saved_questions:
                self.db.refresh(question)

            return saved_questions

        except Exception:

            self.db.rollback()

            raise