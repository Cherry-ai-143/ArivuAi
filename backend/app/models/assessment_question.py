from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

# Type Checking Imports
if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.question import Question


class AssessmentQuestion(Base):
    """Bridge table linking Assessments to master Questions in the Question Bank.

    Questions are never duplicated; this table only references them.
    """

    __tablename__ = "assessment_questions"
    __table_args__ = (
        UniqueConstraint(
            "assessment_id",
            "question_id",
            name="uq_assessment_question",
        ),
    )

    # Primary Key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # Assessment Foreign Key
    assessment_id: Mapped[int] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Question Foreign Key
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Order of the question within the assessment
    order_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # Marks assigned to this question within this assessment
    marks: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # Relationship with Assessment
    assessment: Mapped["Assessment"] = relationship(
        "Assessment",
        back_populates="assessment_questions",
    )

    # Relationship with Question
    question: Mapped["Question"] = relationship(
        "Question",
        back_populates="assessment_questions",
    )