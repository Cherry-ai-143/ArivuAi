"""add user profile fields

Revision ID: e7f890123456
Revises: 92d72980210a
Create Date: 2026-08-02 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7f890123456'
down_revision: Union[str, Sequence[str], None] = '4c73143b230b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('avatar_url', sa.String(length=512), nullable=True))
    op.add_column('users', sa.Column('bio', sa.String(length=1000), nullable=True))
    op.add_column('users', sa.Column('institution_name', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('education_level', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('course', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('branch', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('semester', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('designation', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('department', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('qualification', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('years_of_experience', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('interests', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('goals', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('preferred_language', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('timezone', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'preferred_language')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'goals')
    op.drop_column('users', 'interests')
    op.drop_column('users', 'years_of_experience')
    op.drop_column('users', 'qualification')
    op.drop_column('users', 'department')
    op.drop_column('users', 'designation')
    op.drop_column('users', 'semester')
    op.drop_column('users', 'branch')
    op.drop_column('users', 'course')
    op.drop_column('users', 'education_level')
    op.drop_column('users', 'institution_name')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'avatar_url')
