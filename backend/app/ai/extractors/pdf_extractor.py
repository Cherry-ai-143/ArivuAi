from pathlib import Path

import fitz


class PDFExtractor:

    # Extract text from PDF
    def extract_text(
        self,
        file_path: str,
    ) -> str:

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"PDF not found: {file_path}"
            )

        extracted_text = []

        pdf = fitz.open(path)

        try:

            for page in pdf:

                text = page.get_text()

                extracted_text.append(text)

        finally:

            pdf.close()

        return "\n".join(extracted_text)