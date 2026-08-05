from typing import Any
from google import genai

from app.core.config import settings
from app.ai.providers.base_provider import AIProvider
from app.ai.parsers.json_parser import JsonParser


class GeminiProvider(AIProvider):

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )
        self.parser = JsonParser()
        self.model = getattr(settings, "GEMINI_TEXT_MODEL", "gemini-2.5-flash")

    def generate_content(
        self,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"System Directive: {system_prompt}\n\nUser Prompt: {prompt}"

        response = self.client.models.generate_content(
            model=self.model,
            contents=full_prompt,
        )
        return response.text or ""

    def generate_questions(
        self,
        context: str,
        num_questions: int,
        difficulty_dist: str,
        type_dist: str,
        bloom_level: str,
    ) -> list[dict[str, Any]]:
        # Normalize type_dist
        clean_type = (type_dist or "MULTIPLE_CHOICE").upper().replace(" ", "_").replace("/", "_")
        if clean_type in ["TRUE_FALSE", "TRUE_FALSE"]:
            type_instructions = """
=== MANDATORY QUESTION TYPE RULES (TRUE / FALSE) ===
- Generate ONLY True / False questions.
- Set "question_type": "TRUE_FALSE".
- "option_a" MUST be "True" and "option_b" MUST be "False".
- "correct_option" MUST be "a" (if True) or "b" (if False).
- Leave option_c and option_d as null or empty string.
"""
        elif clean_type in ["FILL_BLANK", "FILL_IN_THE_BLANKS"]:
            type_instructions = """
=== MANDATORY QUESTION TYPE RULES (FILL IN THE BLANKS) ===
- Generate ONLY Fill in the Blanks questions.
- Set "question_type": "FILL_BLANK".
- The "question_text" MUST contain exactly one blank represented as "_____".
- Return the exact correct word or phrase in the "correct_answer" field (e.g. "Guido van Rossum" or "lossy compression").
- Leave option_a, option_b, option_c, option_d, and correct_option as null or empty.
"""
        else:
            type_instructions = """
=== MANDATORY QUESTION TYPE RULES (MULTIPLE CHOICE) ===
- Generate ONLY 4-option Multiple Choice questions.
- Set "question_type": "MULTIPLE_CHOICE".
- Provide 4 distinct, plausible, parallel options (option_a, option_b, option_c, option_d).
- "correct_option" MUST be "a", "b", "c", or "d".
"""

        prompt = f"""
Act as an expert university professor and master assessment author. Generate exactly {num_questions} high-quality questions based strictly on the provided lesson context below.

=== LESSON CONTEXT ===
{context}

{type_instructions}

=== MANDATORY AUTHORING RULES ===
1. Total Questions: Exactly {num_questions}
2. Stem Variation (CRITICAL): Vary stem opening phrases dynamically. Use diverse natural openings like:
   - "Which statement best explains..."
   - "Why does..."
   - "How does..."
   - "What is the primary purpose of..."
   - "Which scenario demonstrates..."
   - "What distinguishes..."
   - "Why is X preferred over Y..."
   DO NOT repeat repetitive phrases like "According to the lesson..." or "In the lesson context...".
3. Bloom's Taxonomy Distribution: Vary question cognitive levels automatically across Knowledge, Understanding, Application, Analysis.
4. Explanations: Provide 1-3 concise natural academic sentences explaining why the correct answer is right.

Return ONLY a valid JSON array of objects matching the required question structure for the type:
[
  {{
    "question_text": "Stem text goes here...",
    "option_a": "Option A text if applicable",
    "option_b": "Option B text if applicable",
    "option_c": "Option C text if applicable",
    "option_d": "Option D text if applicable",
    "correct_option": "a",
    "correct_answer": "Exact answer text if Fill in the Blank",
    "question_type": "{clean_type}",
    "difficulty": "Medium",
    "bloom_level": "Understanding",
    "explanation": "The correct answer is...",
    "source_attribution": "Video 04:12 - 08:30",
    "ai_confidence": 94
  }}
]
"""
        raw_text = self.generate_content(prompt)
        return self.parser.parse(raw_text)
