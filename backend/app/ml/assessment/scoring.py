import numpy as np
from typing import Dict, Any, Optional


class ScoringEngine:
    """
    Transparent scoring system for sign language gesture evaluation.
    Combines classification correctness, prediction confidence, and landmark shape similarity.
    """

    @staticmethod
    def compute_similarity(feature_vector: np.ndarray, reference_vector: Optional[np.ndarray] = None) -> float:
        """
        Computes cosine similarity between learner feature vector and reference gesture feature vector.
        """
        if reference_vector is None or len(reference_vector) == 0:
            return 0.90  # Default baseline similarity when reference prototype is omitted

        norm1 = np.linalg.norm(feature_vector)
        norm2 = np.linalg.norm(reference_vector)

        if norm1 < 1e-7 or norm2 < 1e-7:
            return 0.50

        sim = float(np.dot(feature_vector, reference_vector) / (norm1 * norm2))
        return float(np.clip(sim, 0.0, 1.0))

    def calculate_score(
        self,
        expected_sign: str,
        predicted_sign: str,
        confidence: float,
        feature_vector: Optional[np.ndarray] = None,
        reference_vector: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """
        Calculates transparent assessment score (0 - 100).
        """
        is_correct = expected_sign.strip().lower() == predicted_sign.strip().lower()
        confidence = float(np.clip(confidence, 0.0, 1.0))

        similarity = self.compute_similarity(feature_vector, reference_vector) if feature_vector is not None else 0.90

        if is_correct:
            # Base 60 points for correct sign + up to 40 bonus points for high confidence & hand shape similarity
            score = 60.0 + (40.0 * confidence * similarity)
        else:
            # Incorrect sign: up to 30 partial points if gesture share similarities
            score = 30.0 * confidence * similarity

        final_score = round(float(np.clip(score, 0.0, 100.0)), 1)

        return {
            "score": final_score,
            "is_correct": is_correct,
            "confidence": round(confidence, 4),
            "similarity": round(similarity, 4),
        }
