"""add_course_academic_target_fields

Revision ID: 806d76ab90de
Revises: a3d7b89e102f
Create Date: 2026-08-17 12:05:33.559095

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '806d76ab90de'
down_revision: Union[str, Sequence[str], None] = 'a3d7b89e102f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('courses', sa.Column('target_education_level', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_courses_target_education_level'), 'courses', ['target_education_level'], unique=False)
    op.add_column('courses', sa.Column('target_course', sa.String(length=255), nullable=True))
    op.add_column('courses', sa.Column('target_branch', sa.String(length=255), nullable=True))
    op.add_column('courses', sa.Column('target_year_semester', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('courses', 'target_year_semester')
    op.drop_column('courses', 'target_branch')
    op.drop_column('courses', 'target_course')
    op.drop_index(op.f('ix_courses_target_education_level'), table_name='courses')
    op.drop_column('courses', 'target_education_level')
