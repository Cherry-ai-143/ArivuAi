"""create_assignment_tables

Revision ID: a99e88ff1234
Revises: 806d76ab90de, 21707a2cbfd1
Create Date: 2026-08-21 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a99e88ff1234'
down_revision: Union[str, Sequence[str], None] = ('806d76ab90de', '21707a2cbfd1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name == "postgresql":
        op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_type_enum') THEN CREATE TYPE assignment_type_enum AS ENUM ('WRITTEN', 'PROBLEM_SOLVING', 'PROGRAMMING', 'PROJECT', 'RESEARCH', 'CREATIVE'); END IF; END $$;")
        op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_difficulty_enum') THEN CREATE TYPE assignment_difficulty_enum AS ENUM ('EASY', 'MEDIUM', 'HARD'); END IF; END $$;")
        op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status_enum') THEN CREATE TYPE assignment_status_enum AS ENUM ('DRAFT', 'ACTIVE', 'PENDING_REVIEW', 'COMPLETED'); END IF; END $$;")
        op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status_enum') THEN CREATE TYPE submission_status_enum AS ENUM ('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'LATE', 'UNDER_REVIEW', 'GRADED', 'RETURNED', 'RESUBMISSION_REQUIRED'); END IF; END $$;")

        type_col = postgresql.ENUM('WRITTEN', 'PROBLEM_SOLVING', 'PROGRAMMING', 'PROJECT', 'RESEARCH', 'CREATIVE', name='assignment_type_enum', create_type=False)
        diff_col = postgresql.ENUM('EASY', 'MEDIUM', 'HARD', name='assignment_difficulty_enum', create_type=False)
        status_col = postgresql.ENUM('DRAFT', 'ACTIVE', 'PENDING_REVIEW', 'COMPLETED', name='assignment_status_enum', create_type=False)
        sub_status_col = postgresql.ENUM('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'LATE', 'UNDER_REVIEW', 'GRADED', 'RETURNED', 'RESUBMISSION_REQUIRED', name='submission_status_enum', create_type=False)
    else:
        type_col = sa.String(50)
        diff_col = sa.String(50)
        status_col = sa.String(50)
        sub_status_col = sa.String(50)

    # ----------------------------------------------------
    # Assignments Table
    # ----------------------------------------------------
    op.create_table(
        'assignments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.Integer(), nullable=True),
        sa.Column('teacher_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('instructions', sa.Text(), nullable=False),
        sa.Column('assignment_type', type_col, nullable=False),
        sa.Column('difficulty', diff_col, nullable=False),
        sa.Column('max_points', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', status_col, nullable=False),
        sa.Column('submission_config', sa.JSON(), nullable=True),
        sa.Column('grading_config', sa.JSON(), nullable=True),
        sa.Column('type_config', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assignments_id'), 'assignments', ['id'], unique=False)
    op.create_index(op.f('ix_assignments_course_id'), 'assignments', ['course_id'], unique=False)
    op.create_index(op.f('ix_assignments_lesson_id'), 'assignments', ['lesson_id'], unique=False)
    op.create_index(op.f('ix_assignments_teacher_id'), 'assignments', ['teacher_id'], unique=False)
    op.create_index(op.f('ix_assignments_status'), 'assignments', ['status'], unique=False)

    # ----------------------------------------------------
    # Assignment Rubrics Table
    # ----------------------------------------------------
    op.create_table(
        'assignment_rubrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assignment_id', sa.Integer(), nullable=False),
        sa.Column('criterion_name', sa.String(length=255), nullable=False),
        sa.Column('max_points', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['assignment_id'], ['assignments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assignment_rubrics_id'), 'assignment_rubrics', ['id'], unique=False)
    op.create_index(op.f('ix_assignment_rubrics_assignment_id'), 'assignment_rubrics', ['assignment_id'], unique=False)

    # ----------------------------------------------------
    # Assignment Submissions Table
    # ----------------------------------------------------
    op.create_table(
        'assignment_submissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assignment_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('status', sub_status_col, nullable=False),
        sa.Column('text_response', sa.Text(), nullable=True),
        sa.Column('external_url', sa.String(length=500), nullable=True),
        sa.Column('file_ids', sa.JSON(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('is_late', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('rubric_scores', sa.JSON(), nullable=True),
        sa.Column('graded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('graded_by', sa.Integer(), nullable=True),
        sa.Column('resubmission_reason', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['assignment_id'], ['assignments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['graded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assignment_submissions_id'), 'assignment_submissions', ['id'], unique=False)
    op.create_index(op.f('ix_assignment_submissions_assignment_id'), 'assignment_submissions', ['assignment_id'], unique=False)
    op.create_index(op.f('ix_assignment_submissions_student_id'), 'assignment_submissions', ['student_id'], unique=False)
    op.create_index('idx_submission_assignment_student', 'assignment_submissions', ['assignment_id', 'student_id'], unique=False)


def downgrade() -> None:
    op.drop_table('assignment_submissions')
    op.drop_table('assignment_rubrics')
    op.drop_table('assignments')
