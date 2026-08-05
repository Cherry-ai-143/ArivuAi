import re
from typing import Any
from sqlalchemy.orm import Session
from app.models.question import Question


class QualityValidator:

    def __init__(self, db: Session):
        self.db = db
        self.db = db

    def calculate_levenshtein_similarity(self, s1: str, s2: str) -> float:
        """Calculate normalized Levenshtein similarity between two strings (0.0 to 1.0)."""
        s1 = re.sub(r"[^\w\s]", "", s1.lower()).strip()
        s2 = re.sub(r"[^\w\s]", "", s2.lower()).strip()

        if s1 == s2:
            return 1.0
        if not s1 or not s2:
            return 0.0

        len1, len2 = len(s1), len(s2)
        matrix = [[0] * (len2 + 1) for _ in range(len1 + 1)]

        for i in range(len1 + 1):
            matrix[i][0] = i
        for j in range(len2 + 1):
            matrix[0][j] = j

        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                cost = 0 if s1[i - 1] == s2[j - 1] else 1
                matrix[i][j] = min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost,
                )

        distance = matrix[len1][len2]
        max_len = max(len1, len2)
        return 1.0 - (distance / max_len)

    def calculate_jaccard_similarity(self, s1: str, s2: str) -> float:
        """Calculate Jaccard word-level set similarity between two strings (0.0 to 1.0)."""
        words1 = set(re.sub(r"[^\w\s]", "", s1.lower()).split())
        words2 = set(re.sub(r"[^\w\s]", "", s2.lower()).split())

        if not words1 or not words2:
            return 0.0

        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union)

    def is_duplicate(self, question_text: str, lesson_id: int, existing_candidate_texts: list[str]) -> tuple[bool, str]:
        """4-Layer concept deduplication: Exact -> Normalized -> Levenshtein -> Jaccard Overlap."""
        cand_norm = re.sub(r"[^\w\s]", "", question_text.lower()).strip()

        # Check against candidate items
        for prev in existing_candidate_texts:
            prev_norm = re.sub(r"[^\w\s]", "", prev.lower()).strip()
            if cand_norm == prev_norm:
                return True, "Duplicate candidate question (Exact normalized match)"

            lev_sim = self.calculate_levenshtein_similarity(question_text, prev)
            if lev_sim >= 0.85:
                return True, f"Duplicate candidate question ({int(lev_sim * 100)}% text similarity)"

            jaccard_sim = self.calculate_jaccard_similarity(question_text, prev)
            if jaccard_sim >= 0.70:
                return True, f"Duplicate concept detected ({int(jaccard_sim * 100)}% word overlap)"

        # Check against DB questions
        db_questions = self.db.query(Question).filter(Question.lesson_id == lesson_id).all()
        for db_q in db_questions:
            db_norm = re.sub(r"[^\w\s]", "", db_q.question_text.lower()).strip()
            if cand_norm == db_norm:
                return True, f"Duplicate of existing Question #{db_q.id}"

            lev_sim = self.calculate_levenshtein_similarity(question_text, db_q.question_text)
            if lev_sim >= 0.85:
                return True, f"Duplicate of existing Question #{db_q.id} ({int(lev_sim * 100)}% text similarity)"

            jaccard_sim = self.calculate_jaccard_similarity(question_text, db_q.question_text)
            if jaccard_sim >= 0.70:
                return True, f"Duplicate concept of Question #{db_q.id} ({int(jaccard_sim * 100)}% word overlap)"

        return False, ""

    def validate_distractor_quality(self, options: list[str]) -> tuple[bool, str, int]:
        """Validate options plausibility, length similarity ratio, and distinctness."""
        lens = [len(o) for o in options]
        min_l, max_l = min(lens), max(lens)

        if min_l == 0:
            return False, "Option choice cannot be blank", 0

        # Ratio check: max option length shouldn't exceed min length by more than 3.5x
        if max_l / max(1, min_l) > 3.5 and min_l < 10:
            return True, "Distractor length variance elevated", 12

        # Absurd distractor check
        for o in options:
            o_lower = o.lower().strip()
            if o_lower in ["banana", "dog", "apple", "car", "xyz", "foo", "bar"]:
                return False, f"Implausible distractor option '{o}' detected", 0

        return True, "Valid distractors", 20

    def calibrate_difficulty(self, question_text: str, bloom_level: str, options: list[str]) -> str:
        """Programmatically compute difficulty (Easy, Medium, Hard) based on cognitive load."""
        stem_len = len(question_text.split())
        avg_opt_len = sum(len(o.split()) for o in options) / max(1, len(options))

        bloom_score = {
            "Knowledge": 1,
            "Understanding": 2,
            "Application": 3,
            "Analysis": 4,
            "Evaluation": 5,
        }.get(bloom_level, 2)

        complexity = bloom_score + (1 if stem_len > 18 else 0) + (1 if avg_opt_len > 8 else 0)

        if complexity <= 2:
            return "Easy"
        elif complexity <= 4:
            return "Medium"
        else:
            return "Hard"

    def validate_and_score_question(self, q: dict[str, Any], lesson_id: int, existing_candidate_texts: list[str]) -> dict[str, Any]:
        """Compute 100-Point Quality Score across Bloom, Options, Stem, Source, and Uniqueness."""
        question_text = q.get("question_text", "").strip()

        # 1. Deduplication (20 pts)
        is_dup, reason = self.is_duplicate(question_text, lesson_id, existing_candidate_texts)
        if is_dup:
            return {
                "is_valid": False,
                "approved": False,
                "rejected_reason": reason,
                "score": 0,
                "calibrated_difficulty": "Medium",
            }
        uniqueness_score = 20

        # 2. Options Plausibility & Parallelism (20 pts)
        q_type_str = str(q.get("question_type", "MULTIPLE_CHOICE")).upper().replace(" ", "_").replace("/", "_")
        
        if "FILL" in q_type_str or q.get("correct_answer"):
            c_ans = (q.get("correct_answer") or "").strip()
            if not c_ans:
                return {
                    "is_valid": False,
                    "approved": False,
                    "rejected_reason": "Fill in the blank question requires a correct answer",
                    "score": 30,
                    "calibrated_difficulty": "Medium",
                }
            option_score = 20
            options = [c_ans]
        elif "TRUE" in q_type_str:
            options = ["True", "False"]
            option_score = 20
        else:
            options = [
                (q.get("option_a") or "").strip(),
                (q.get("option_b") or "").strip(),
                (q.get("option_c") or "").strip(),
                (q.get("option_d") or "").strip(),
            ]

            if len(set(o.lower() for o in options)) < 4:
                return {
                    "is_valid": False,
                    "approved": False,
                    "rejected_reason": "Duplicate option text choices detected",
                    "score": 25,
                    "calibrated_difficulty": "Medium",
                }

            valid_dist, dist_msg, option_score = self.validate_distractor_quality(options)
            if not valid_dist:
                return {
                    "is_valid": False,
                    "approved": False,
                    "rejected_reason": dist_msg,
                    "score": 30,
                    "calibrated_difficulty": "Medium",
                }

        # 3. Bloom & Cognitive Alignment (20 pts)
        bloom_level = q.get("bloom_level", "Understanding")
        bloom_score = 20 if bloom_level in ["Knowledge", "Understanding", "Application", "Analysis", "Evaluation"] else 12

        # 4. Stem & Grammar Quality (20 pts)
        stem_score = 20
        if question_text.lower().startswith("according to the lesson") or question_text.lower().startswith("in the lesson context"):
            stem_score = 12

        # 5. Source Attribution & Explanation (20 pts)
        source_score = 20
        if not q.get("explanation", "").strip():
            source_score -= 8

        total_score = uniqueness_score + option_score + bloom_score + stem_score + source_score
        calibrated_diff = self.calibrate_difficulty(question_text, bloom_level, options)

        # Thresholds: <70 Auto-Reject, 70-85 Needs Review (approved=False), >=85 Auto-Approve Candidate (approved=True)
        is_valid = total_score >= 70
        is_approved = total_score >= 85

        rejected_reason = None
        if not is_valid:
            rejected_reason = f"Low Quality Score ({total_score}/100)"
        elif not is_approved:
            rejected_reason = f"Requires Review (Quality Score: {total_score}/100)"

        return {
            "is_valid": is_valid,
            "approved": is_approved,
            "rejected_reason": rejected_reason,
            "score": min(100, total_score),
            "calibrated_difficulty": calibrated_diff,
        }
