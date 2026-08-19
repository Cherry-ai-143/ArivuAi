"""add_question_type_enum_values

Revision ID: 21707a2cbfd1
Revises: 806d76ab90de
Create Date: 2026-08-19 12:35:59.123720

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '21707a2cbfd1'
down_revision: Union[str, Sequence[str], None] = '806d76ab90de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'TRUE_FALSE'")
        op.execute("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'FILL_BLANK'")
        op.execute("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'SHORT_ANSWER'")
        op.execute("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'MATCHING'")
        op.execute("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'ORDERING'")
        op.execute("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'MIXED'")


def downgrade() -> None:
    """Downgrade schema."""
    pass

