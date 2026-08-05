import threading
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_generation_job_service import AIGenerationJobService
from app.ai.extractors.resource_extractor_service import ResourceExtractorService

router = APIRouter()


@router.get(
    "/lessons/{lesson_id}/ai-resources",
    summary="Discover attached lesson resources for AI question generation",
)
def discover_lesson_resources(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    extractor = ResourceExtractorService(db)
    return extractor.discover_lesson_resources(lesson_id)


@router.get(
    "/lessons/{lesson_id}/resource-preview/{resource_id}",
    summary="Get raw content preview of an extracted PDF page or YouTube transcript",
)
def get_resource_preview(
    lesson_id: int,
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    return service.get_resource_preview(lesson_id, resource_id)


@router.get(
    "/lessons/{lesson_id}/generation-history",
    summary="Get past AI generation jobs for the lesson to support review resuming",
)
def get_generation_history(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    return service.get_generation_history(lesson_id)


@router.post(
    "/lessons/{lesson_id}/generate-preview",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Initialize async AI question generation job",
)
def generate_question_preview(
    lesson_id: int,
    configuration: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    job = service.create_job(lesson_id, current_user.id, configuration)

    # Launch processing in background thread
    def background_worker(j_id: str):
        from app.database.session import SessionLocal
        bg_db = SessionLocal()
        try:
            bg_service = AIGenerationJobService(bg_db)
            bg_service.execute_job_sync(j_id)
        finally:
            bg_db.close()

    thread = threading.Thread(target=background_worker, args=(job.job_id,), daemon=True)
    thread.start()

    return {
        "job_id": job.job_id,
        "status": job.status,
        "progress_pct": job.progress_pct,
        "progress_message": job.progress_message,
        "total_words": job.total_words,
        "estimated_duration_sec": job.estimated_duration_sec,
    }


@router.get(
    "/lessons/{lesson_id}/generation-status/{job_id}",
    summary="Poll job status, state machine progress, and candidate questions",
)
def get_generation_status(
    lesson_id: int,
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    res = service.get_job_status(job_id)
    if not res.get("found"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI Generation job not found.",
        )
    return res


@router.put(
    "/lessons/{lesson_id}/review-question/{temp_question_id}",
    summary="Update inline edits or toggle approved status for a candidate question",
)
def review_candidate_question(
    lesson_id: int,
    temp_question_id: int,
    update_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    updated = service.update_candidate_question(temp_question_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate question not found.",
        )
    return updated


@router.post(
    "/lessons/{lesson_id}/approve-questions/{job_id}",
    summary="Persist approved candidate questions into Question Bank",
)
def approve_and_save_questions(
    lesson_id: int,
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    saved = service.approve_and_save_questions(job_id, current_user.id)
    return {
        "message": f"Successfully persisted {len(saved)} approved questions to Question Bank.",
        "count": len(saved),
    }


@router.get(
    "/lessons/{lesson_id}/resource-preview/{resource_key}",
    summary="Fetch extracted text snippet for resource content preview",
)
def get_resource_preview(
    lesson_id: int,
    resource_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    extractor = ResourceExtractorService(db)
    cache = extractor.get_resource_cache(resource_key)
    if not cache:
        return {
            "resource_key": resource_key,
            "preview_text": "Extracted text content ready for AI question generation.",
            "word_count": 0,
            "cached": False,
        }
    return {
        "resource_key": resource_key,
        "preview_text": cache.cached_text[:4000],
        "word_count": cache.word_count,
        "cached": True,
        "resource_type": cache.resource_type,
    }


@router.get(
    "/lessons/{lesson_id}/generation-history",
    summary="Get past AI generation jobs history for a lesson",
)
def get_generation_history(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIGenerationJobService(db)
    return service.get_lesson_generation_history(lesson_id, current_user.id)
