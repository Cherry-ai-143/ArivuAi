from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.dashboard import DashboardRepository


class DashboardService:

    def __init__(self, db: Session):
        self.repository = DashboardRepository(db)

    def get_student_dashboard(self, user: User) -> dict:
        return self.repository.get_student_dashboard_data(user)

    def get_teacher_dashboard(self, user: User) -> dict:
        return self.repository.get_teacher_dashboard_data(user)

    def get_admin_dashboard(self, user: User) -> dict:
        return self.repository.get_admin_dashboard_data(user)
