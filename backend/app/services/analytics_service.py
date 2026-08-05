from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, distinct

from app.models.study_session import StudySession
from app.models.lesson_progress import LessonProgress
from app.models.course_enrollment import CourseEnrollment, EnrollmentStatus
from app.models.assessment_attempt import AssessmentAttempt


class AnalyticsService:

    def __init__(self, db: Session):
        self.db = db

    def get_student_analytics(self, student_id: int) -> Dict[str, Any]:
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # 1. Total Study Hours
        total_seconds = self.db.execute(
            select(func.coalesce(func.sum(StudySession.duration_seconds), 0)).where(
                StudySession.student_id == student_id
            )
        ).scalar() or 0
        total_study_hours = round(total_seconds / 3600.0, 1)

        # 2. Weekly Study Hours
        weekly_seconds = self.db.execute(
            select(func.coalesce(func.sum(StudySession.duration_seconds), 0)).where(
                StudySession.student_id == student_id,
                StudySession.started_at >= week_ago,
            )
        ).scalar() or 0
        weekly_study_hours = round(weekly_seconds / 3600.0, 1)

        # 3. Monthly Study Hours
        monthly_seconds = self.db.execute(
            select(func.coalesce(func.sum(StudySession.duration_seconds), 0)).where(
                StudySession.student_id == student_id,
                StudySession.started_at >= month_ago,
            )
        ).scalar() or 0
        monthly_study_hours = round(monthly_seconds / 3600.0, 1)

        # 4. Lessons Completed
        lessons_completed = self.db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.student_id == student_id,
                LessonProgress.completed == True,
            )
        ).scalar() or 0

        # 5. Courses Completed
        courses_completed = self.db.execute(
            select(func.count(CourseEnrollment.id)).where(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.status == EnrollmentStatus.COMPLETED,
            )
        ).scalar() or 0

        # 6. Average Assessment Score
        avg_score_res = self.db.execute(
            select(func.avg(AssessmentAttempt.score)).where(
                AssessmentAttempt.student_id == student_id
            )
        ).scalar()
        average_score = round(float(avg_score_res), 1) if avg_score_res else 0.0

        # 7. Learning Streak (Consecutive Active Days)
        streak = self.calculate_learning_streak(student_id)

        return {
            "total_study_hours": total_study_hours,
            "weekly_study_hours": weekly_study_hours,
            "monthly_study_hours": monthly_study_hours,
            "lessons_completed": lessons_completed,
            "courses_completed": courses_completed,
            "average_score": average_score,
            "current_streak": streak["current_streak"],
            "longest_streak": streak["longest_streak"],
            "last_active": streak["last_active"],
        }

    def calculate_learning_streak(self, student_id: int) -> Dict[str, Any]:
        # Fetch distinct active dates from StudySessions & AssessmentAttempts
        session_dates = self.db.execute(
            select(func.date(StudySession.started_at)).where(
                StudySession.student_id == student_id
            )
        ).scalars().all()

        attempt_dates = self.db.execute(
            select(func.date(AssessmentAttempt.created_at)).where(
                AssessmentAttempt.student_id == student_id
            )
        ).scalars().all()

        all_dates = sorted(list(set(session_dates + attempt_dates)), reverse=True)
        if not all_dates:
            return {"current_streak": 0, "longest_streak": 0, "last_active": "Never"}

        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)

        current_streak = 0
        longest_streak = 0
        temp_streak = 0

        last_active_str = "Today" if all_dates[0] == today else "Yesterday" if all_dates[0] == yesterday else str(all_dates[0])

        # Current streak logic
        check_date = today if all_dates[0] == today else yesterday if all_dates[0] == yesterday else None
        if check_date:
            date_set = set(all_dates)
            curr = check_date
            while curr in date_set:
                current_streak += 1
                curr -= timedelta(days=1)

        # Longest streak logic
        date_set = set(all_dates)
        sorted_asc = sorted(list(date_set))
        for i, d in enumerate(sorted_asc):
            if i == 0 or d == sorted_asc[i - 1] + timedelta(days=1):
                temp_streak += 1
            else:
                temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)

        return {
            "current_streak": current_streak,
            "longest_streak": max(current_streak, longest_streak),
            "last_active": last_active_str,
        }
