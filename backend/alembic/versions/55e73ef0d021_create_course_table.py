"""create course table

Revision ID: 55e73ef0d021
Revises: 18dbb13843a9
Create Date: 2026-07-24 13:14:22.699308

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "55e73ef0d021"
down_revision: Union[str, Sequence[str], None] = "18dbb13843a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ------------------------------------------------------------------
    # Create Courses Table
    # ------------------------------------------------------------------
    op.create_table(
        "courses",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "teacher_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "thumbnail",
            sa.String(length=255),
            nullable=True,
        ),
        sa.Column(
            "level",
            sa.Enum(
                "BEGINNER",
                "INTERMEDIATE",
                "ADVANCED",
                name="course_level_enum",
            ),
            nullable=False,
        ),
        sa.Column(
            "language",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "duration_hours",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "is_published",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_courses_id",
        "courses",
        ["id"],
        unique=False,
    )

    # ------------------------------------------------------------------
    # Add Course FK to Assessments
    # ------------------------------------------------------------------
    op.add_column(
        "assessments",
        sa.Column(
            "course_id",
            sa.Integer(),
            nullable=False,
        ),
    )

    op.create_foreign_key(
        "fk_assessments_course_id",
        "assessments",
        "courses",
        ["course_id"],
        ["id"],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_assessments_course_id",
        "assessments",
        type_="foreignkey",
    )

    op.drop_column(
        "assessments",
        "course_id",
    )

    op.drop_index(
        "ix_courses_id",
        table_name="courses",
    )

    op.drop_table("courses")

    op.execute("DROP TYPE IF EXISTS course_level_enum")