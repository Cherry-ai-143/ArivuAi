"""add institution_type to user

Revision ID: g9b012345678
Revises: f8a901234567
Create Date: 2026-08-03 04:42:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g9b012345678'
down_revision: Union[str, Sequence[str], None] = 'f8a901234567'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('institution_type', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'institution_type')
