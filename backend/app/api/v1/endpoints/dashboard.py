from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.core.role_checker import RoleChecker
from app.schemas.dashboard import (
    StudentDashboardResponse,
    TeacherDashboardResponse,
    AdminDashboardResponse,
)
from app.services.dashboard import DashboardService

router = APIRouter()


@router.get(
    "/student",
    response_model=StudentDashboardResponse,
    summary="Get optimized student dashboard aggregation data",
)
def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DashboardService(db)
    return service.get_student_dashboard(current_user)


@router.get(
    "/teacher",
    response_model=TeacherDashboardResponse,
    summary="Get optimized teacher dashboard aggregation data",
)
def get_teacher_dashboard(
    current_user: User = Depends(RoleChecker(["teacher", "admin"])),
    db: Session = Depends(get_db),
):
    service = DashboardService(db)
    return service.get_teacher_dashboard(current_user)


@router.get(
    "/admin",
    response_model=AdminDashboardResponse,
    summary="Get optimized admin dashboard aggregation data",
)
def get_admin_dashboard(
    current_user: User = Depends(RoleChecker(["admin"])),
    db: Session = Depends(get_db),
):
    service = DashboardService(db)
    return service.get_admin_dashboard(current_user)
