from google import genai

from app.core.config import settings

from app.ai.prompts.question_prompt import (
    QUESTION_GENERATION_PROMPT,
)

from app.ai.parsers.json_parser import JsonParser


class QuestionGenerator:

    def __init__(self):

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self.parser = JsonParser()

    # Generate Questions
    def generate_questions(
        self,
        context: str,
        difficulty: str,
        num_questions: int,
    ):

        prompt = QUESTION_GENERATION_PROMPT.format(
            context=context,
            difficulty=difficulty,
            num_questions=num_questions,
        )
        
        print(settings.GEMINI_TEXT_MODEL)

        response = self.client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=prompt,
        )

        return self.parser.parse(
            response.text
        )