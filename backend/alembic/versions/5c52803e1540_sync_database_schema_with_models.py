"""sync database schema with models

Revision ID: 5c52803e1540
Revises: 01131647779a
Create Date: 2026-08-12 16:41:15.329867

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text


# revision identifiers, used by Alembic.
revision: str = "5c52803e1540"
down_revision: Union[str, Sequence[str], None] = "01131647779a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _inspector():
    return inspect(op.get_bind())


def _column_exists(table_name: str, column_name: str) -> bool:
    inspector = _inspector()
    return column_name in {
        column["name"]
        for column in inspector.get_columns(table_name)
    }


def _index_exists(table_name: str, index_name: str) -> bool:
    inspector = _inspector()
    return index_name in {
        index["name"]
        for index in inspector.get_indexes(table_name)
    }


def _foreign_key_constraints(table_name: str):
    inspector = _inspector()
    return inspector.get_foreign_keys(table_name)


def _find_foreign_key(
    table_name: str,
    local_column: str,
    referred_table: str | None = None,
):
    """
    Find a foreign-key constraint by local column and optionally
    referred table.
    """
    for fk in _foreign_key_constraints(table_name):
        local_columns = fk.get("constrained_columns") or []
        target_table = fk.get("referred_table")

        if local_column in local_columns:
            if referred_table is None or target_table == referred_table:
                return fk

    return None


def _drop_foreign_key(
    table_name: str,
    local_column: str,
    referred_table: str | None = None,
):
    """
    Safely drop a foreign-key constraint.

    Important:
    We never call op.drop_constraint(None, ...).
    """
    fk = _find_foreign_key(
        table_name,
        local_column,
        referred_table,
    )

    if fk and fk.get("name"):
        op.drop_constraint(
            fk["name"],
            table_name,
            type_="foreignkey",
        )


def _unique_constraint_exists(
    table_name: str,
    columns: list[str],
) -> bool:
    inspector = _inspector()

    expected = set(columns)

    for constraint in inspector.get_unique_constraints(table_name):
        constraint_columns = set(
            constraint.get("column_names") or []
        )

        if constraint_columns == expected:
            return True

    return False


def _enum_type_exists(type_name: str) -> bool:
    """
    PostgreSQL-specific check for an existing ENUM type.
    """
    connection = op.get_bind()

    result = connection.execute(
        text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = :type_name
            )
            """
        ),
        {"type_name": type_name},
    )

    return bool(result.scalar())


# ---------------------------------------------------------------------------
# Upgrade
# ---------------------------------------------------------------------------

def upgrade() -> None:
    """Upgrade schema."""

    # -----------------------------------------------------------------------
    # ENUM TYPES
    # -----------------------------------------------------------------------

    assessment_type_enum = sa.Enum(
        "QUIZ",
        "PRACTICE",
        "CHAPTER_TEST",
        "MIDTERM",
        "FINAL",
        name="assessmenttype",
        create_type=False,
    )

    assessment_scope_enum = sa.Enum(
        "LESSON",
        "CHAPTER",
        "COURSE",
        name="assessmentscope",
        create_type=False,
    )

    assessment_status_enum = sa.Enum(
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
        name="assessmentstatus",
        create_type=False,
    )

    # Create PostgreSQL ENUM types only when they do not already exist.
    connection = op.get_bind()

    if not _enum_type_exists("assessmenttype"):
        assessment_type_enum.create(connection, checkfirst=True)

    if not _enum_type_exists("assessmentscope"):
        assessment_scope_enum.create(connection, checkfirst=True)

    if not _enum_type_exists("assessmentstatus"):
        assessment_status_enum.create(connection, checkfirst=True)

    # -----------------------------------------------------------------------
    # ASSESSMENTS TABLE
    # -----------------------------------------------------------------------

    if not _column_exists("assessments", "assessment_type"):
        op.add_column(
            "assessments",
            sa.Column(
                "assessment_type",
                assessment_type_enum,
                nullable=False,
                server_default="QUIZ",
            ),
        )

        op.alter_column(
            "assessments",
            "assessment_type",
            server_default=None,
        )

    if not _column_exists("assessments", "scope"):
        op.add_column(
            "assessments",
            sa.Column(
                "scope",
                assessment_scope_enum,
                nullable=False,
                server_default="COURSE",
            ),
        )

        op.alter_column(
            "assessments",
            "scope",
            server_default=None,
        )

    if not _column_exists("assessments", "status"):
        op.add_column(
            "assessments",
            sa.Column(
                "status",
                assessment_status_enum,
                nullable=False,
                server_default="DRAFT",
            ),
        )

        op.alter_column(
            "assessments",
            "status",
            server_default=None,
        )

    if not _column_exists("assessments", "chapter_id"):
        op.add_column(
            "assessments",
            sa.Column(
                "chapter_id",
                sa.Integer(),
                nullable=True,
            ),
        )

    if not _column_exists("assessments", "lesson_id"):
        op.add_column(
            "assessments",
            sa.Column(
                "lesson_id",
                sa.Integer(),
                nullable=True,
            ),
        )

    if not _column_exists("assessments", "passing_score"):
        op.add_column(
            "assessments",
            sa.Column(
                "passing_score",
                sa.Integer(),
                nullable=False,
                server_default="40",
            ),
        )

        op.alter_column(
            "assessments",
            "passing_score",
            server_default=None,
        )

    if not _column_exists("assessments", "max_attempts"):
        op.add_column(
            "assessments",
            sa.Column(
                "max_attempts",
                sa.Integer(),
                nullable=False,
                server_default="3",
            ),
        )

        op.alter_column(
            "assessments",
            "max_attempts",
            server_default=None,
        )

    if not _column_exists("assessments", "shuffle_questions"):
        op.add_column(
            "assessments",
            sa.Column(
                "shuffle_questions",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        )

        op.alter_column(
            "assessments",
            "shuffle_questions",
            server_default=None,
        )

    if not _column_exists("assessments", "shuffle_options"):
        op.add_column(
            "assessments",
            sa.Column(
                "shuffle_options",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        )

        op.alter_column(
            "assessments",
            "shuffle_options",
            server_default=None,
        )

    if not _column_exists("assessments", "show_correct_answers"):
        op.add_column(
            "assessments",
            sa.Column(
                "show_correct_answers",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("true"),
            ),
        )

        op.alter_column(
            "assessments",
            "show_correct_answers",
            server_default=None,
        )

    # -----------------------------------------------------------------------
    # ASSESSMENT INDEXES
    # -----------------------------------------------------------------------

    if _column_exists("assessments", "chapter_id"):
        if not _index_exists(
            "assessments",
            "ix_assessments_chapter_id",
        ):
            op.create_index(
                "ix_assessments_chapter_id",
                "assessments",
                ["chapter_id"],
                unique=False,
            )

    if _column_exists("assessments", "course_id"):
        if not _index_exists(
            "assessments",
            "ix_assessments_course_id",
        ):
            op.create_index(
                "ix_assessments_course_id",
                "assessments",
                ["course_id"],
                unique=False,
            )

    if _column_exists("assessments", "lesson_id"):
        if not _index_exists(
            "assessments",
            "ix_assessments_lesson_id",
        ):
            op.create_index(
                "ix_assessments_lesson_id",
                "assessments",
                ["lesson_id"],
                unique=False,
            )

    # -----------------------------------------------------------------------
    # ASSESSMENT FOREIGN KEYS
    # -----------------------------------------------------------------------

    if _column_exists("assessments", "chapter_id"):
        existing_fk = _find_foreign_key(
            "assessments",
            "chapter_id",
            "chapters",
        )

        if existing_fk is None:
            op.create_foreign_key(
                "fk_assessments_chapter_id",
                "assessments",
                "chapters",
                ["chapter_id"],
                ["id"],
            )

    if _column_exists("assessments", "lesson_id"):
        existing_fk = _find_foreign_key(
            "assessments",
            "lesson_id",
            "lessons",
        )

        if existing_fk is None:
            op.create_foreign_key(
                "fk_assessments_lesson_id",
                "assessments",
                "lessons",
                ["lesson_id"],
                ["id"],
            )

    # -----------------------------------------------------------------------
    # REMOVE OLD total_marks COLUMN
    # -----------------------------------------------------------------------

    if _column_exists("assessments", "total_marks"):
        op.drop_column(
            "assessments",
            "total_marks",
        )

    # -----------------------------------------------------------------------
    # DOCUMENT CHUNKS
    # -----------------------------------------------------------------------

    # The old migration attempted to remove this unique constraint.
    # Only remove it if it actually exists.
    inspector = _inspector()

    for constraint in inspector.get_unique_constraints(
        "document_chunks"
    ):
        constraint_name = constraint.get("name")
        constraint_columns = set(
            constraint.get("column_names") or []
        )

        if (
            constraint_columns
            == {"uploaded_file_id", "chunk_index"}
        ):
            if constraint_name:
                op.drop_constraint(
                    constraint_name,
                    "document_chunks",
                    type_="unique",
                )
            break

    # -----------------------------------------------------------------------
    # QUESTIONS TABLE
    # -----------------------------------------------------------------------

    question_columns = [
        (
            "lesson_id",
            sa.Column(
                "lesson_id",
                sa.Integer(),
                nullable=True,
            ),
        ),
        (
            "difficulty",
            sa.Column(
                "difficulty",
                sa.String(length=50),
                nullable=True,
            ),
        ),
        (
            "bloom_level",
            sa.Column(
                "bloom_level",
                sa.String(length=50),
                nullable=True,
            ),
        ),
        (
            "explanation",
            sa.Column(
                "explanation",
                sa.Text(),
                nullable=True,
            ),
        ),
        (
            "correct_answer",
            sa.Column(
                "correct_answer",
                sa.Text(),
                nullable=True,
            ),
        ),
        (
            "is_ai_generated",
            sa.Column(
                "is_ai_generated",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        ),
        (
            "ai_version",
            sa.Column(
                "ai_version",
                sa.String(length=50),
                nullable=True,
            ),
        ),
        (
            "prompt_template_id",
            sa.Column(
                "prompt_template_id",
                sa.Integer(),
                nullable=True,
            ),
        ),
        (
            "source_type",
            sa.Column(
                "source_type",
                sa.String(length=50),
                nullable=True,
            ),
        ),
        (
            "source_attribution",
            sa.Column(
                "source_attribution",
                sa.String(length=255),
                nullable=True,
            ),
        ),
        (
            "ai_confidence",
            sa.Column(
                "ai_confidence",
                sa.Integer(),
                nullable=True,
            ),
        ),
        (
            "tokens_input",
            sa.Column(
                "tokens_input",
                sa.Integer(),
                nullable=True,
            ),
        ),
        (
            "tokens_output",
            sa.Column(
                "tokens_output",
                sa.Integer(),
                nullable=True,
            ),
        ),
        (
            "estimated_cost",
            sa.Column(
                "estimated_cost",
                sa.Float(),
                nullable=True,
            ),
        ),
        (
            "usage_count",
            sa.Column(
                "usage_count",
                sa.Integer(),
                nullable=False,
                server_default="0",
            ),
        ),
    ]

    for column_name, column in question_columns:
        if not _column_exists("questions", column_name):
            op.add_column(
                "questions",
                column,
            )

            if column_name in {
                "is_ai_generated",
                "usage_count",
            }:
                op.alter_column(
                    "questions",
                    column_name,
                    server_default=None,
                )

    # -----------------------------------------------------------------------
    # QUESTION OPTION NULLABILITY
    # -----------------------------------------------------------------------

    question_option_columns = [
        (
            "option_a",
            sa.VARCHAR(length=255),
        ),
        (
            "option_b",
            sa.VARCHAR(length=255),
        ),
        (
            "option_c",
            sa.VARCHAR(length=255),
        ),
        (
            "option_d",
            sa.VARCHAR(length=255),
        ),
        (
            "correct_option",
            sa.VARCHAR(length=1),
        ),
    ]

    for column_name, column_type in question_option_columns:
        if _column_exists("questions", column_name):
            op.alter_column(
                "questions",
                column_name,
                existing_type=column_type,
                nullable=True,
            )

    # -----------------------------------------------------------------------
    # QUESTIONS LESSON INDEX
    # -----------------------------------------------------------------------

    if _column_exists("questions", "lesson_id"):
        if not _index_exists(
            "questions",
            "ix_questions_lesson_id",
        ):
            op.create_index(
                "ix_questions_lesson_id",
                "questions",
                ["lesson_id"],
                unique=False,
            )

    # -----------------------------------------------------------------------
    # QUESTIONS ASSESSMENT FOREIGN KEY
    # -----------------------------------------------------------------------

    if _column_exists("questions", "assessment_id"):
        _drop_foreign_key(
            "questions",
            "assessment_id",
            "assessments",
        )

    # -----------------------------------------------------------------------
    # QUESTIONS LESSON FOREIGN KEY
    # -----------------------------------------------------------------------

    if _column_exists("questions", "lesson_id"):
        existing_fk = _find_foreign_key(
            "questions",
            "lesson_id",
            "lessons",
        )

        if existing_fk is None:
            op.create_foreign_key(
                "fk_questions_lesson_id",
                "questions",
                "lessons",
                ["lesson_id"],
                ["id"],
                ondelete="SET NULL",
            )

    # -----------------------------------------------------------------------
    # REMOVE OLD assessment_id FROM QUESTIONS
    # -----------------------------------------------------------------------

    if _column_exists("questions", "assessment_id"):
        op.drop_column(
            "questions",
            "assessment_id",
        )

    # -----------------------------------------------------------------------
    # UPLOADED FILES
    # -----------------------------------------------------------------------

    if _index_exists(
        "uploaded_files",
        "ix_uploaded_files_course_id",
    ):
        op.drop_index(
            "ix_uploaded_files_course_id",
            table_name="uploaded_files",
        )

    # Remove existing course_id FK safely.
    if _column_exists("uploaded_files", "course_id"):
        _drop_foreign_key(
            "uploaded_files",
            "course_id",
            "courses",
        )

        # Create the desired FK if it does not exist.
        existing_fk = _find_foreign_key(
            "uploaded_files",
            "course_id",
            "courses",
        )

        if existing_fk is None:
            op.create_foreign_key(
                "fk_uploaded_files_course_id",
                "uploaded_files",
                "courses",
                ["course_id"],
                ["id"],
            )


# ---------------------------------------------------------------------------
# Downgrade
# ---------------------------------------------------------------------------

def downgrade() -> None:
    """Downgrade schema."""

    # -----------------------------------------------------------------------
    # UPLOADED FILES
    # -----------------------------------------------------------------------

    if _column_exists("uploaded_files", "course_id"):
        _drop_foreign_key(
            "uploaded_files",
            "course_id",
            "courses",
        )

        existing_fk = _find_foreign_key(
            "uploaded_files",
            "course_id",
            "courses",
        )

        if existing_fk is None:
            op.create_foreign_key(
                "fk_uploaded_files_course_id",
                "uploaded_files",
                "courses",
                ["course_id"],
                ["id"],
                ondelete="CASCADE",
            )

        if not _index_exists(
            "uploaded_files",
            "ix_uploaded_files_course_id",
        ):
            op.create_index(
                "ix_uploaded_files_course_id",
                "uploaded_files",
                ["course_id"],
                unique=False,
            )

    # -----------------------------------------------------------------------
    # QUESTIONS
    # -----------------------------------------------------------------------

    if not _column_exists("questions", "assessment_id"):
        op.add_column(
            "questions",
            sa.Column(
                "assessment_id",
                sa.INTEGER(),
                autoincrement=False,
                nullable=True,
            ),
        )

    # Remove lesson FK.
    if _column_exists("questions", "lesson_id"):
        _drop_foreign_key(
            "questions",
            "lesson_id",
            "lessons",
        )

    # Restore assessment FK.
    if _column_exists("questions", "assessment_id"):
        existing_fk = _find_foreign_key(
            "questions",
            "assessment_id",
            "assessments",
        )

        if existing_fk is None:
            op.create_foreign_key(
                "questions_assessment_id_fkey",
                "questions",
                "assessments",
                ["assessment_id"],
                ["id"],
            )

    # Drop lesson index.
    if _index_exists(
        "questions",
        "ix_questions_lesson_id",
    ):
        op.drop_index(
            "ix_questions_lesson_id",
            table_name="questions",
        )

    # Restore original NOT NULL question options.
    question_option_columns = [
        (
            "correct_option",
            sa.VARCHAR(length=1),
        ),
        (
            "option_d",
            sa.VARCHAR(length=255),
        ),
        (
            "option_c",
            sa.VARCHAR(length=255),
        ),
        (
            "option_b",
            sa.VARCHAR(length=255),
        ),
        (
            "option_a",
            sa.VARCHAR(length=255),
        ),
    ]

    for column_name, column_type in question_option_columns:
        if _column_exists("questions", column_name):
            op.alter_column(
                "questions",
                column_name,
                existing_type=column_type,
                nullable=False,
            )

    # Remove newly added question columns.
    question_new_columns = [
        "usage_count",
        "estimated_cost",
        "tokens_output",
        "tokens_input",
        "ai_confidence",
        "source_attribution",
        "source_type",
        "prompt_template_id",
        "ai_version",
        "is_ai_generated",
        "correct_answer",
        "explanation",
        "bloom_level",
        "difficulty",
        "lesson_id",
    ]

    for column_name in question_new_columns:
        if _column_exists("questions", column_name):
            op.drop_column(
                "questions",
                column_name,
            )

    # -----------------------------------------------------------------------
    # DOCUMENT CHUNKS
    # -----------------------------------------------------------------------

    if not _unique_constraint_exists(
        "document_chunks",
        ["uploaded_file_id", "chunk_index"],
    ):
        op.create_unique_constraint(
            "uq_uploaded_file_chunk",
            "document_chunks",
            ["uploaded_file_id", "chunk_index"],
        )

    # -----------------------------------------------------------------------
    # ASSESSMENTS
    # -----------------------------------------------------------------------

    if not _column_exists(
        "assessments",
        "total_marks",
    ):
        op.add_column(
            "assessments",
            sa.Column(
                "total_marks",
                sa.INTEGER(),
                autoincrement=False,
                nullable=True,
            ),
        )

    # Remove assessment foreign keys.
    if _column_exists("assessments", "chapter_id"):
        _drop_foreign_key(
            "assessments",
            "chapter_id",
            "chapters",
        )

    if _column_exists("assessments", "lesson_id"):
        _drop_foreign_key(
            "assessments",
            "lesson_id",
            "lessons",
        )

    # Remove assessment indexes.
    for index_name in [
        "ix_assessments_lesson_id",
        "ix_assessments_course_id",
        "ix_assessments_chapter_id",
    ]:
        if _index_exists(
            "assessments",
            index_name,
        ):
            op.drop_index(
                index_name,
                table_name="assessments",
            )

    # Remove assessment columns.
    assessment_columns = [
        "show_correct_answers",
        "shuffle_options",
        "shuffle_questions",
        "max_attempts",
        "passing_score",
        "lesson_id",
        "chapter_id",
        "status",
        "scope",
        "assessment_type",
    ]

    for column_name in assessment_columns:
        if _column_exists(
            "assessments",
            column_name,
        ):
            op.drop_column(
                "assessments",
                column_name,
            )

    # -----------------------------------------------------------------------
    # ENUM TYPES
    # -----------------------------------------------------------------------

    connection = op.get_bind()

    if _enum_type_exists("assessmentstatus"):
        assessment_status_enum = sa.Enum(
            "DRAFT",
            "PUBLISHED",
            "ARCHIVED",
            name="assessmentstatus",
        )
        assessment_status_enum.drop(
            connection,
            checkfirst=True,
        )

    if _enum_type_exists("assessmentscope"):
        assessment_scope_enum = sa.Enum(
            "LESSON",
            "CHAPTER",
            "COURSE",
            name="assessmentscope",
        )
        assessment_scope_enum.drop(
            connection,
            checkfirst=True,
        )

    if _enum_type_exists("assessmenttype"):
        assessment_type_enum = sa.Enum(
            "QUIZ",
            "PRACTICE",
            "CHAPTER_TEST",
            "MIDTERM",
            "FINAL",
            name="assessmenttype",
        )
        assessment_type_enum.drop(
            connection,
            checkfirst=True,
        )