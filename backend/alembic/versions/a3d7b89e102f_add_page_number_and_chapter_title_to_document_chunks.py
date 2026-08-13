"""add page_number and chapter_title to document_chunks

Revision ID: a3d7b89e102f
Revises: 5c52803e1540
Create Date: 2026-08-13 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3d7b89e102f'
down_revision: Union[str, Sequence[str], None] = '5c52803e1540'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # purpose : Add page_number and chapter_title columns to document_chunks table
    op.add_column('document_chunks', sa.Column('page_number', sa.Integer(), nullable=True))
    op.add_column('document_chunks', sa.Column('chapter_title', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # purpose : Revert addition of page_number and chapter_title columns
    op.drop_column('document_chunks', 'chapter_title')
    op.drop_column('document_chunks', 'page_number')
