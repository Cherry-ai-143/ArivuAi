"""merge uploaded_files course_id branch

Revision ID: 0bae70c0210d
Revises: g9b012345678, d45d7a8b5151
Create Date: 2026-08-12 14:48:41.023443

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0bae70c0210d'
down_revision: Union[str, Sequence[str], None] = ('g9b012345678', 'd45d7a8b5151')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
