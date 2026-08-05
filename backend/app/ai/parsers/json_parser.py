import json


class JsonParser:

    # Parse Gemini JSON Response
    def parse(
        self,
        response_text: str,
    ):

        response_text = response_text.strip()

        if response_text.startswith("```json"):
            response_text = (
                response_text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        return json.loads(response_text)