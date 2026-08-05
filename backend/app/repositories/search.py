from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.lesson import Lesson
from app.models.chapter import Chapter
from app.models.assessment import Assessment
from app.models.question import Question
from app.models.content import Content


class SearchRepository:

    def __init__(self, db: Session):
        self.db = db

    def global_search(self, q: str, search_type: str = "all", limit: int = 10) -> dict:
        term = f"%{q.strip()}%"
        results = {
            "query": q,
            "total_results": 0,
            "courses": [],
            "lessons": [],
            "chapters": [],
            "assessments": [],
            "questions": [],
            "contents": [],
        }

        # Courses
        if search_type in ["all", "course", "courses"]:
            cq = select(Course).where(or_(Course.title.ilike(term), Course.description.ilike(term))).limit(limit)
            courses = self.db.execute(cq).scalars().all()
            results["courses"] = [
                {
                    "id": c.id,
                    "title": c.title,
                    "type": "Course",
                    "description": c.description,
                    "link": f"/dashboard/courses/{c.id}",
                    "extra": {"level": c.level.value if hasattr(c.level, "value") else str(c.level)},
                }
                for c in courses
            ]

        # Lessons
        if search_type in ["all", "lesson", "lessons"]:
            lq = select(Lesson).where(or_(Lesson.title.ilike(term), Lesson.description.ilike(term))).limit(limit)
            lessons = self.db.execute(lq).scalars().all()
            results["lessons"] = [
                {
                    "id": l.id,
                    "title": l.title,
                    "type": "Lesson",
                    "description": l.description,
                    "link": f"/dashboard/courses/lessons/{l.id}",
                    "extra": {"chapter_id": l.chapter_id, "order_number": l.order_number},
                }
                for l in lessons
            ]

        # Chapters
        if search_type in ["all", "chapter", "chapters"]:
            chq = select(Chapter).where(Chapter.title.ilike(term)).limit(limit)
            chapters = self.db.execute(chq).scalars().all()
            results["chapters"] = [
                {
                    "id": ch.id,
                    "title": ch.title,
                    "type": "Chapter",
                    "description": f"Chapter {ch.order_number}",
                    "link": f"/dashboard/courses/chapters/{ch.id}",
                    "extra": {"course_id": ch.course_id},
                }
                for ch in chapters
            ]

        # Assessments
        if search_type in ["all", "assessment", "assessments"]:
            aq = select(Assessment).where(Assessment.title.ilike(term)).limit(limit)
            assessments = self.db.execute(aq).scalars().all()
            results["assessments"] = [
                {
                    "id": a.id,
                    "title": a.title,
                    "type": "Assessment",
                    "description": f"Assessment Marks: {a.total_marks}",
                    "link": f"/dashboard/assessments/{a.id}",
                    "extra": {"duration_minutes": a.duration_minutes},
                }
                for a in assessments
            ]

        # Questions
        if search_type in ["all", "question", "questions"]:
            qq = select(Question).where(Question.question_text.ilike(term)).limit(limit)
            questions = self.db.execute(qq).scalars().all()
            results["questions"] = [
                {
                    "id": qu.id,
                    "title": qu.question_text[:80],
                    "type": "Question",
                    "description": qu.question_text,
                    "link": f"/dashboard/questions/{qu.id}",
                    "extra": {"marks": qu.marks},
                }
                for qu in questions
            ]

        # Contents
        if search_type in ["all", "content", "contents"]:
            ctq = select(Content).where(Content.title.ilike(term)).limit(limit)
            contents = self.db.execute(ctq).scalars().all()
            results["contents"] = [
                {
                    "id": ct.id,
                    "title": ct.title,
                    "type": "Content",
                    "description": ct.file_url,
                    "link": ct.file_url,
                    "extra": {"content_type": ct.content_type.value if hasattr(ct.content_type, "value") else str(ct.content_type)},
                }
                for ct in contents
            ]

        results["total_results"] = (
            len(results["courses"])
            + len(results["lessons"])
            + len(results["chapters"])
            + len(results["assessments"])
            + len(results["questions"])
            + len(results["contents"])
        )
        return results
