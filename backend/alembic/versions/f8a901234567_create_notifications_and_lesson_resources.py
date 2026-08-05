"""create notifications and lesson_resources

Revision ID: f8a901234567
Revises: e7f890123456
Create Date: 2026-08-02 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8a901234567'
down_revision: Union[str, Sequence[str], None] = 'e7f890123456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=100), server_default='System Message', nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('link', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)

    op.create_table(
        'lesson_resources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('url', sa.String(length=1000), nullable=True),
        sa.Column('file_path', sa.String(length=1000), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('author', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lesson_resources_id'), 'lesson_resources', ['id'], unique=False)
    op.create_index(op.f('ix_lesson_resources_lesson_id'), 'lesson_resources', ['lesson_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_lesson_resources_lesson_id'), table_name='lesson_resources')
    op.drop_index(op.f('ix_lesson_resources_id'), table_name='lesson_resources')
    op.drop_table('lesson_resources')

    op.drop_index(op.f('ix_notifications_created_at'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')
