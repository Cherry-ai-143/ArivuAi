"""create lesson table

Revision ID: 0ca1bc849289
Revises: 27b035e48597
Create Date: 2026-07-24 20:14:39.143036
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = "0ca1bc849289"
down_revision: Union[str, Sequence[str], None] = "27b035e48597"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Create Lessons Table
    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chapter_id", sa.Integer(), sa.ForeignKey("chapters.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("order_number", sa.Integer(), nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index(
        "ix_lessons_id",
        "lessons",
        ["id"],
    )

    # Create Contents Table
    op.create_table(
        "contents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column(
            "content_type",
            sa.Enum(
                "VIDEO",
                "PDF",
                "PPT",
                "DOC",
                "IMAGE",
                "LINK",
                name="content_type_enum",
            ),
            nullable=False,
        ),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("order_number", sa.Integer(), nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index(
        "ix_contents_id",
        "contents",
        ["id"],
    )


def downgrade() -> None:

    op.drop_index("ix_contents_id", table_name="contents")
    op.drop_table("contents")

    op.drop_index("ix_lessons_id", table_name="lessons")
    op.drop_table("lessons")

    op.execute("DROP TYPE IF EXISTS content_type_enum")