import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.session import engine
from app.database.base import Base
import app.models  # Ensures all models are registered with Base.metadata


def init_db_tables():
    print("Creating all missing database tables (course_enrollments, lesson_progress, study_sessions, student_bookmarks)...")
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully!")


if __name__ == "__main__":
    init_db_tables()
