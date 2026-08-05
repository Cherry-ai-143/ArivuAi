import re
from typing import Any


class TokenChunker:

    def __init__(self, target_tokens: int = 4000, overlap_tokens: int = 250):
        self.target_tokens = target_tokens
        self.overlap_tokens = overlap_tokens

    def estimate_tokens(self, text: str) -> int:
        """Estimate token count based on word and character counts (~1.35 tokens/word)."""
        words = len(text.split())
        chars = len(text)
        return int(max(words * 1.35, chars / 4.0))

    def _extract_source_range(self, chunk_text: str, chunk_index: int) -> str:
        """Extract fine-grained source timestamp or page range from chunk text."""
        timestamps = re.findall(r"\[(\d{2}:\d{2})\]", chunk_text)
        if len(timestamps) >= 2:
            return f"Video {timestamps[0]} - {timestamps[-1]}"
        elif len(timestamps) == 1:
            return f"Video {timestamps[0]}"

        pages = re.findall(r"Page\s+(\d+)", chunk_text, re.IGNORECASE)
        if len(pages) >= 2:
            return f"PDF Pages {pages[0]} - {pages[-1]}"
        elif len(pages) == 1:
            return f"PDF Page {pages[0]}"

        return f"Section {chunk_index}"

    def chunk_context(self, context_text: str) -> list[dict[str, Any]]:
        """Split context into token chunks with configurable token overlap."""
        total_tokens = self.estimate_tokens(context_text)
        if total_tokens <= self.target_tokens:
            s_range = self._extract_source_range(context_text, 1)
            return [{
                "chunk_number": 1,
                "text": context_text,
                "token_count": total_tokens,
                "source_range": s_range if s_range != "Section 1" else "Full Lesson Context",
            }]

        lines = context_text.splitlines()
        chunks = []
        current_lines = []
        current_tokens = 0
        chunk_index = 1

        for line in lines:
            line_tokens = self.estimate_tokens(line) + 1  # newline
            if current_tokens + line_tokens > self.target_tokens and current_lines:
                chunk_text = "\n".join(current_lines)
                chunks.append({
                    "chunk_number": chunk_index,
                    "text": chunk_text,
                    "token_count": current_tokens,
                    "source_range": self._extract_source_range(chunk_text, chunk_index),
                })
                chunk_index += 1

                # Overlap: keep last few lines totaling ~overlap_tokens
                overlap_lines = []
                overlap_toks = 0
                for prev_line in reversed(current_lines):
                    p_toks = self.estimate_tokens(prev_line) + 1
                    if overlap_toks + p_toks <= self.overlap_tokens:
                        overlap_lines.insert(0, prev_line)
                        overlap_toks += p_toks
                    else:
                        break
                current_lines = overlap_lines
                current_tokens = overlap_toks

            current_lines.append(line)
            current_tokens += line_tokens

        if current_lines:
            chunk_text = "\n".join(current_lines)
            chunks.append({
                "chunk_number": chunk_index,
                "text": chunk_text,
                "token_count": current_tokens,
                "source_range": self._extract_source_range(chunk_text, chunk_index),
            })

        return chunks
