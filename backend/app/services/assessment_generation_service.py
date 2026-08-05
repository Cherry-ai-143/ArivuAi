from sqlalchemy.orm import Session

from app.repositories.lesson import LessonRepository
from app.repositories.assessment import AssessmentRepository
from app.repositories.question import QuestionRepository

from app.schemas.assessment import AssessmentCreate
from app.schemas.question import QuestionCreate

from app.ai.vectorstore.chroma_service import ChromaService
from app.ai.generators.question_generator import QuestionGenerator


class AssessmentGenerationService:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

        # Repositories
        self.lesson_repository = LessonRepository(db)
        self.assessment_repository = AssessmentRepository(db)
        self.question_repository = QuestionRepository(db)

        # AI Services
        self.chroma = ChromaService()
        self.question_generator = QuestionGenerator()

    # ==========================================
    # Main AI Quiz Generation Pipeline
    # ==========================================
    def generate_quiz(
        self,
        lesson_id: int,
        difficulty: str,
        num_questions: int,
    ):

        # --------------------------------------
        # Step 1: Verify Lesson
        # --------------------------------------
        lesson = self.lesson_repository.get_by_id(
            lesson_id
        )

        if lesson is None:
            raise ValueError(
                f"Lesson with ID {lesson_id} not found."
            )

        print("✅ Lesson found:", lesson.title)

        # --------------------------------------
        # Step 2: Retrieve Relevant Chunks
        # --------------------------------------
        print("🔍 Searching lesson content...")

        results = self.chroma.search(
            query=lesson.title,
            top_k=10,
            metadata={
                "lesson_id": lesson.id,
            },
        )

        if not results:
            raise ValueError(
                "No indexed document chunks found for this lesson."
            )

        print(
            f"✅ Retrieved {len(results)} chunks"
        )

        for i, chunk in enumerate(results):
            print("=" * 50)
            print(f"Chunk {i + 1}")
            print("Metadata:", chunk["metadata"])
            print("Text Preview:")
            print(chunk["text"][:300])
            print()

        # --------------------------------------
        # Step 3: Build Context
        # --------------------------------------
        context = "\n\n".join(
            result["text"]
            for result in results
        )

        print(
            f"Context Length: {len(context)} characters"
        )

        # --------------------------------------
        # Step 4: Generate AI Questions
        # --------------------------------------
        print("Generating AI questions...")

        questions = self.question_generator.generate_questions(
            context=context,
            difficulty=difficulty,
            num_questions=num_questions,
        )

        print(
            f"Generated {len(questions)} questions"
        )

        # --------------------------------------
        # Step 5: Create Assessment
        # --------------------------------------
        print("Creating assessment...")

        assessment = self.assessment_repository.create_assessment(
            AssessmentCreate(
                course_id=lesson.chapter.course_id,
                title=f"{lesson.title} Assessment",
                description=(
                    f"AI Generated Assessment for "
                    f"{lesson.title}"
                ),
                duration_minutes=15,
                total_marks=sum(
                    question["marks"]
                    for question in questions
                ),
            ),
            created_by=1,
        )

        print(
            f"Assessment Created : {assessment.id}"
        )

        # --------------------------------------
        # Step 6: Save AI Questions
        # --------------------------------------
        print("Saving AI questions...")

        saved_questions = []

        for index, question in enumerate(
            questions,
            start=1,
        ):

            saved_question = self.question_repository.create_question(
                QuestionCreate(
                    assessment_id=assessment.id,
                    question_text=question["question_text"],
                    option_a=question["option_a"],
                    option_b=question["option_b"],
                    option_c=question["option_c"],
                    option_d=question["option_d"],
                    correct_option=question["correct_option"],
                    marks=question["marks"],
                    order_number=index,
                )
            )

            saved_questions.append(
                saved_question
            )

        print(
            f"Saved {len(saved_questions)} questions"
        )

        # --------------------------------------
        # Step 7: Return Result
        # --------------------------------------
        return {
            "assessment": assessment,
            "questions": saved_questions,
        }