from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):

    @abstractmethod
    def generate_content(
        self,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate raw text response from LLM."""
        pass

    @abstractmethod
    def generate_questions(
        self,
        context: str,
        num_questions: int,
        difficulty_dist: str,
        type_dist: str,
        bloom_level: str,
    ) -> list[dict[str, Any]]:
        """Generate structured question objects."""
        pass
