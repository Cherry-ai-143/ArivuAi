QUESTION_GENERATION_PROMPT = """
You are an expert university examiner.

Generate {num_questions} multiple-choice questions.

Difficulty:
{difficulty}

Rules:

1. Use ONLY the provided context.
2. Do NOT use external knowledge.
3. Generate high-quality academic questions.
4. Each question must contain exactly four options.
5. Only one option is correct.
6. Provide a short explanation.
7. Return ONLY valid JSON.
8. Do not wrap the response inside markdown.

Context:

{context}

Output Format:

[
  {{
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_option": "A",
    "marks": 2,
    "explanation": "..."
  }}
]
"""