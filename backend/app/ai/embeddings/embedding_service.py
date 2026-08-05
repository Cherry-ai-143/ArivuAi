from google import genai

from app.core.config import settings


class EmbeddingService:

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    # Generate Embedding
    def generate_embedding(
        self,
        text: str,
    ) -> list[float]:

        response = self.client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )

        return response.embeddings[0].values