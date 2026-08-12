"""add course_id to uploaded_files

Revision ID: d45d7a8b5151
Revises: 9848579269d1
Create Date: 2026-08-12 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd45d7a8b5151'
down_revision = '9848579269d1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        'uploaded_files',
        'lesson_id',
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.add_column(
        'uploaded_files',
        sa.Column('course_id', sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        'fk_uploaded_files_course_id',
        'uploaded_files',
        'courses',
        ['course_id'],
        ['id'],
        ondelete='CASCADE',
    )
    op.create_index(
        op.f('ix_uploaded_files_course_id'),
        'uploaded_files',
        ['course_id'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_uploaded_files_course_id'), table_name='uploaded_files')
    op.drop_constraint('fk_uploaded_files_course_id', 'uploaded_files', type_='foreignkey')
    op.drop_column('uploaded_files', 'course_id')
    op.alter_column(
        'uploaded_files',
        'lesson_id',
        existing_type=sa.Integer(),
        nullable=False,
    )
