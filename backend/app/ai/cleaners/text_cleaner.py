import re


class TextCleaner:

    # Clean extracted text
    def clean(
        self,
        text: str,
    ) -> str:

        if not text:
            return ""

        # Normalize line endings
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")

        # Replace tabs with spaces
        text = text.replace("\t", " ")

        # Collapse multiple spaces
        text = re.sub(
            r"[ ]+",
            " ",
            text,
        )

        # Remove trailing spaces before newlines
        text = re.sub(
            r" *\n",
            "\n",
            text,
        )

        # Collapse 3+ newlines into 2
        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text,
        )

        return text.strip()