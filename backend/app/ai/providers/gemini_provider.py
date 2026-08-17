from typing import Any

from google import genai

from app.core.config import settings
from app.ai.providers.base_provider import AIProvider
from app.ai.parsers.json_parser import JsonParser


class GeminiProvider(AIProvider):

    # ==========================================================
    # Initialization
    # ==========================================================

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self.parser = JsonParser()

        self.model = getattr(
            settings,
            "GEMINI_TEXT_MODEL",
            "gemini-2.5-flash",
        )

    # ==========================================================
    # Generate Raw Content
    # ==========================================================

    def generate_content(
        self,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:

        full_prompt = prompt

        if system_prompt:
            full_prompt = (
                f"System Directive: {system_prompt}\n\n"
                f"User Prompt: {prompt}"
            )

        response = self.client.models.generate_content(
            model=self.model,
            contents=full_prompt,
        )

        return response.text or ""

    # ==========================================================
    # Normalize Question Type
    # ==========================================================

    def _normalize_question_type(
        self,
        type_dist: str | None,
    ) -> str:

        clean_type = (
            type_dist or "MULTIPLE_CHOICE"
        ).upper().strip()

        clean_type = (
            clean_type
            .replace(" ", "_")
            .replace("-", "_")
            .replace("/", "_")
        )

        # ------------------------------------------------------
        # Multiple Choice
        # ------------------------------------------------------

        if clean_type in {
            "MULTIPLE_CHOICE",
            "MULTIPLECHOICE",
            "MCQ",
        }:
            return "MULTIPLE_CHOICE"

        # ------------------------------------------------------
        # True / False
        # ------------------------------------------------------

        if clean_type in {
            "TRUE_FALSE",
            "TRUEFALSE",
            "TRUE_OR_FALSE",
        }:
            return "TRUE_FALSE"

        # ------------------------------------------------------
        # Fill in the Blank
        # ------------------------------------------------------

        if clean_type in {
            "FILL_BLANK",
            "FILL_IN_THE_BLANK",
            "FILL_IN_THE_BLANKS",
            "FILLINTHEBLANK",
            "FILLINTHEBLANKS",
        }:
            return "FILL_BLANK"

        # ------------------------------------------------------
        # Short Answer
        # ------------------------------------------------------

        if clean_type in {
            "SHORT_ANSWER",
            "SHORTANSWER",
        }:
            return "SHORT_ANSWER"

        # ------------------------------------------------------
        # Matching
        # ------------------------------------------------------

        if clean_type in {
            "MATCHING",
        }:
            return "MATCHING"

        # ------------------------------------------------------
        # Ordering
        # ------------------------------------------------------

        if clean_type in {
            "ORDERING",
            "ORDER",
        }:
            return "ORDERING"

        # ------------------------------------------------------
        # Mixed
        # ------------------------------------------------------

        if clean_type in {
            "MIXED",
        }:
            return "MIXED"

        # ------------------------------------------------------
        # Safety fallback
        # ------------------------------------------------------

        return "MULTIPLE_CHOICE"

    # ==========================================================
    # Normalize Generated Question
    # ==========================================================

    def _normalize_generated_question(
        self,
        question: dict[str, Any],
    ) -> dict[str, Any]:

        normalized = dict(question)

        raw_type = (
            question.get("question_type")
            or "MULTIPLE_CHOICE"
        )

        question_type = self._normalize_question_type(
            raw_type
        )

        normalized["question_type"] = question_type

        # ======================================================
        # MULTIPLE CHOICE
        # ======================================================

        if question_type == "MULTIPLE_CHOICE":

            normalized["option_a"] = (
                question.get("option_a") or ""
            )

            normalized["option_b"] = (
                question.get("option_b") or ""
            )

            normalized["option_c"] = (
                question.get("option_c") or ""
            )

            normalized["option_d"] = (
                question.get("option_d") or ""
            )

            correct_option = (
                question.get("correct_option") or ""
            ).lower().strip()

            if correct_option not in {
                "a",
                "b",
                "c",
                "d",
            }:
                correct_option = "a"

            normalized["correct_option"] = correct_option
            normalized["correct_answer"] = None

        # ======================================================
        # TRUE / FALSE
        # ======================================================

        elif question_type == "TRUE_FALSE":

            normalized["option_a"] = "True"
            normalized["option_b"] = "False"
            normalized["option_c"] = None
            normalized["option_d"] = None

            correct_option = (
                question.get("correct_option") or ""
            ).lower().strip()

            if correct_option not in {
                "a",
                "b",
            }:
                correct_option = "a"

            normalized["correct_option"] = correct_option
            normalized["correct_answer"] = None

        # ======================================================
        # FILL IN THE BLANK
        # ======================================================

        elif question_type == "FILL_BLANK":

            normalized["option_a"] = None
            normalized["option_b"] = None
            normalized["option_c"] = None
            normalized["option_d"] = None
            normalized["correct_option"] = None

            normalized["correct_answer"] = (
                question.get("correct_answer") or ""
            )

            question_text = (
                question.get("question_text") or ""
            )

            # Ensure there is a blank.
            if "_____" not in question_text:
                question_text = (
                    question_text.rstrip()
                    + " _____"
                )

            normalized["question_text"] = question_text

        # ======================================================
        # SHORT ANSWER
        # ======================================================

        elif question_type == "SHORT_ANSWER":

            normalized["option_a"] = None
            normalized["option_b"] = None
            normalized["option_c"] = None
            normalized["option_d"] = None
            normalized["correct_option"] = None

            normalized["correct_answer"] = (
                question.get("correct_answer") or ""
            )

        # ======================================================
        # OTHER QUESTION TYPES
        # ======================================================

        else:

            normalized.setdefault("option_a", None)
            normalized.setdefault("option_b", None)
            normalized.setdefault("option_c", None)
            normalized.setdefault("option_d", None)

        return normalized

    # ==========================================================
    # Generate Questions
    # ==========================================================

    def generate_questions(
        self,
        context: str,
        num_questions: int,
        difficulty_dist: str,
        type_dist: str,
        bloom_level: str,
    ) -> list[dict[str, Any]]:

        # ======================================================
        # Normalize Requested Type
        # ======================================================

        clean_type = self._normalize_question_type(
            type_dist
        )

        # ======================================================
        # Question Type Instructions
        # ======================================================

        if clean_type == "TRUE_FALSE":

            type_instructions = """
=== MANDATORY QUESTION TYPE RULES: TRUE / FALSE ===

- Generate ONLY True / False questions.
- Set "question_type" EXACTLY to "TRUE_FALSE".
- "option_a" MUST be exactly "True".
- "option_b" MUST be exactly "False".
- "option_c" MUST be null.
- "option_d" MUST be null.
- "correct_option" MUST be exactly "a" or "b".
- "correct_answer" MUST be null.
"""

        elif clean_type == "FILL_BLANK":

            type_instructions = """
=== MANDATORY QUESTION TYPE RULES: FILL IN THE BLANK ===

- Generate ONLY Fill in the Blank questions.
- Set "question_type" EXACTLY to "FILL_BLANK".
- The question_text MUST contain exactly one blank.
- Represent the blank using exactly "_____".
- "correct_answer" MUST contain the exact answer.
- "option_a" MUST be null.
- "option_b" MUST be null.
- "option_c" MUST be null.
- "option_d" MUST be null.
- "correct_option" MUST be null.
"""

        elif clean_type == "SHORT_ANSWER":

            type_instructions = """
=== MANDATORY QUESTION TYPE RULES: SHORT ANSWER ===

- Generate ONLY Short Answer questions.
- Set "question_type" EXACTLY to "SHORT_ANSWER".
- "option_a" MUST be null.
- "option_b" MUST be null.
- "option_c" MUST be null.
- "option_d" MUST be null.
- "correct_option" MUST be null.
- "correct_answer" MUST contain the expected answer.
"""

        else:

            # ==================================================
            # MULTIPLE CHOICE
            # ==================================================

            type_instructions = """
=== MANDATORY QUESTION TYPE RULES: MULTIPLE CHOICE ===

- Generate ONLY Multiple Choice Questions.
- Set "question_type" EXACTLY to "MULTIPLE_CHOICE".
- Generate EXACTLY 4 options for EVERY question.
- option_a MUST contain non-empty text.
- option_b MUST contain non-empty text.
- option_c MUST contain non-empty text.
- option_d MUST contain non-empty text.
- All four options MUST be distinct.
- All four options MUST be plausible and relevant.
- Only ONE option can be correct.
- "correct_option" MUST be exactly one of:
  "a", "b", "c", or "d".
- "correct_answer" MUST be null.
- Do NOT generate True / False questions.
- Do NOT generate Fill in the Blank questions.
- Do NOT omit any option.
"""

        # ======================================================
        # Gemini Prompt
        # ======================================================

        prompt = f"""
Act as an expert university professor and master assessment author.

Generate exactly {num_questions} high-quality questions based
STRICTLY on the supplied source context.

============================================================
SUPPLIED SOURCE CONTEXT
============================================================

{context}

============================================================
QUESTION TYPE
============================================================

{type_instructions}

============================================================
SOURCE ISOLATION RULES
============================================================

1. Use ONLY the supplied source context.

2. DO NOT use outside knowledge.

3. DO NOT use general domain knowledge unless it is explicitly
   present in the supplied context.

4. Every question MUST be directly answerable from the supplied
   source context.

5. Every correct answer MUST be directly supported by the
   supplied source context.

6. DO NOT create questions about information that does not exist
   in the supplied context.

7. DO NOT reference other chapters, modules, websites,
   textbooks, or external information.

============================================================
AUTHORING RULES
============================================================

1. Generate EXACTLY {num_questions} questions.

2. Questions must be academically meaningful.

3. Avoid duplicate or nearly identical questions.

4. Vary question wording naturally.

5. Avoid repeatedly starting questions with:
   "According to the lesson..."

6. Use varied openings such as:

   - Which statement best explains...
   - Why does...
   - How does...
   - What is the primary purpose of...
   - Which scenario demonstrates...
   - What distinguishes...
   - Which of the following...
   - What is the main reason...

7. Bloom's Taxonomy Level:
   {bloom_level}

8. Difficulty:
   {difficulty_dist}

9. Explanations must be concise.

10. Every explanation must be supported by the supplied
    source context.

11. Do not add Markdown.

12. Do not add comments outside the JSON.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY a valid JSON array.

For MULTIPLE_CHOICE:

[
  {{
    "question_text": "Question text...",
    "option_a": "Option A...",
    "option_b": "Option B...",
    "option_c": "Option C...",
    "option_d": "Option D...",
    "correct_option": "a",
    "correct_answer": null,
    "question_type": "MULTIPLE_CHOICE",
    "difficulty": "Medium",
    "bloom_level": "Understanding",
    "explanation": "Explanation...",
    "source_attribution": "Source context",
    "ai_confidence": 94
  }}
]

For TRUE_FALSE:

[
  {{
    "question_text": "Question text...",
    "option_a": "True",
    "option_b": "False",
    "option_c": null,
    "option_d": null,
    "correct_option": "a",
    "correct_answer": null,
    "question_type": "TRUE_FALSE",
    "difficulty": "Medium",
    "bloom_level": "Understanding",
    "explanation": "Explanation...",
    "source_attribution": "Source context",
    "ai_confidence": 94
  }}
]

For FILL_BLANK:

[
  {{
    "question_text": "Question with _____...",
    "option_a": null,
    "option_b": null,
    "option_c": null,
    "option_d": null,
    "correct_option": null,
    "correct_answer": "Correct answer",
    "question_type": "FILL_BLANK",
    "difficulty": "Medium",
    "bloom_level": "Understanding",
    "explanation": "Explanation...",
    "source_attribution": "Source context",
    "ai_confidence": 94
  }}
]

For SHORT_ANSWER:

[
  {{
    "question_text": "Question text...",
    "option_a": null,
    "option_b": null,
    "option_c": null,
    "option_d": null,
    "correct_option": null,
    "correct_answer": "Expected answer",
    "question_type": "SHORT_ANSWER",
    "difficulty": "Medium",
    "bloom_level": "Understanding",
    "explanation": "Explanation...",
    "source_attribution": "Source context",
    "ai_confidence": 94
  }}
]

============================================================
FINAL REQUIREMENTS
============================================================

- Return ONLY the JSON array.
- Do NOT wrap the JSON in ```json.
- Do NOT add any explanation before or after the JSON.
- Follow the requested question type EXACTLY.
- Generate exactly {num_questions} questions.
- For MULTIPLE_CHOICE, ALWAYS provide four options.
- For MULTIPLE_CHOICE, ALWAYS provide exactly one correct_option.
- The correct_option MUST match the actual correct answer.
"""

        # ======================================================
        # Call Gemini
        # ======================================================

        raw_text = self.generate_content(prompt)

        # ======================================================
        # Parse JSON
        # ======================================================

        parsed_questions = self.parser.parse(raw_text)

        # ======================================================
        # Validate Parsed Result
        # ======================================================

        if not isinstance(parsed_questions, list):
            raise ValueError(
                "Gemini response must be a JSON array of questions."
            )

        # ======================================================
        # Normalize Every Question
        # ======================================================

        normalized_questions: list[dict[str, Any]] = []

        for question in parsed_questions:

            if not isinstance(question, dict):
                continue

            normalized_question = (
                self._normalize_generated_question(
                    question
                )
            )

            normalized_questions.append(
                normalized_question
            )

        # ======================================================
        # Ensure Requested Number of Questions
        # ======================================================

        if len(normalized_questions) != num_questions:
            raise ValueError(
                f"Gemini generated {len(normalized_questions)} "
                f"questions, but {num_questions} were requested."
            )

        return normalized_questions