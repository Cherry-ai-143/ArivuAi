"""create document chunks table

Revision ID: 4c73143b230b
Revises: 9848579269d1
Create Date: 2026-07-25 17:14:48.390280

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4c73143b230b"
down_revision: Union[str, Sequence[str], None] = "9848579269d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "document_chunks",

        # Primary Key
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),

        # Uploaded File
        sa.Column(
            "uploaded_file_id",
            sa.Integer(),
            nullable=False,
        ),

        # Chunk Order
        sa.Column(
            "chunk_index",
            sa.Integer(),
            nullable=False,
        ),

        # Chunk Text
        sa.Column(
            "chunk_text",
            sa.Text(),
            nullable=False,
        ),

        # Created Time
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        # Foreign Key
        sa.ForeignKeyConstraint(
            ["uploaded_file_id"],
            ["uploaded_files.id"],
        ),

        # Prevent duplicate chunk numbers
        sa.UniqueConstraint(
            "uploaded_file_id",
            "chunk_index",
            name="uq_uploaded_file_chunk",
        ),

        # Primary Key
        sa.PrimaryKeyConstraint(
            "id",
        ),
    )

    op.create_index(
        op.f("ix_document_chunks_id"),
        "document_chunks",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_document_chunks_id"),
        table_name="document_chunks",
    )

    op.drop_table(
        "document_chunks",
    )