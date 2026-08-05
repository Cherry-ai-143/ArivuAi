"""create assessment table

Revision ID: c227c795b262
Revises: 1adba97a6357
Create Date: 2026-07-23 13:18:03.783192
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision = "c227c795b262"
down_revision = "1adba97a6357"
branch_labels = None
depends_on = None


def upgrade() -> None:

    op.create_table(
        "assessments",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "title",
            sa.String(255),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "duration_minutes",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "total_marks",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "created_by",
            sa.Integer(),
            sa.ForeignKey("users.id"),
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
        "ix_assessments_id",
        "assessments",
        ["id"],
        unique=False,
    )


def downgrade() -> None:

    op.drop_index(
        "ix_assessments_id",
        table_name="assessments",
    )

    op.drop_table("assessments")