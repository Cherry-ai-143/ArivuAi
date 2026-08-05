class TextChunker:

    def __init__(
        self,
        chunk_size: int = 800,
        chunk_overlap: int = 150,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    # Split text into chunks
    def split_text(
        self,
        text: str,
    ) -> list[str]:

        if not text:
            return []

        chunks = []

        start = 0

        while start < len(text):

            end = start + self.chunk_size

            chunk = text[start:end]

            chunks.append(chunk)

            start += (
                self.chunk_size
                - self.chunk_overlap
            )

        return chunks