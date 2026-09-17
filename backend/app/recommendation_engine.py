from typing import List, Dict
from pydantic import BaseModel

class SignAttempt(BaseModel):
    sign: str
    course_id: str
    accuracy: float
    mistake_type: str # 'hand_shape' | 'motion' | 'timing'

class RecommendationResponse(BaseModel):
    mastery_level: str
    overall_accuracy: float
    recommended_course_id: str
    recommended_course_title: str
    reason: str
    target_drill_signs: List[str]
    suggested_actions: List[str]

class AdaptiveRecommendationEngine:
    def __init__(self):
        # Curriculum hierarchy
        self.course_progression = [
            {"id": "basics-of-asl", "title": "Basics of ASL", "min_accuracy": 0.0},
            {"id": "family-home", "title": "Family & Home", "min_accuracy": 0.75},
            {"id": "classroom-signs", "title": "Classroom Signs", "min_accuracy": 0.80},
            {"id": "medical-terms", "title": "Medical Terms", "min_accuracy": 0.85},
            {"id": "business-etiquette", "title": "Business Etiquette", "min_accuracy": 0.90},
        ]

    def generate_recommendations(self, practice_history: List[Dict]) -> Dict:
        """
        Module 8: Learning Progress Intelligence & Adaptive Routing
        Evaluates history and generates next best learning steps.
        """
        if not practice_history:
            return {
                "mastery_level": "Novice (Tier I)",
                "overall_accuracy": 0.0,
                "recommended_course_id": "basics-of-asl",
                "recommended_course_title": "Basics of ASL",
                "reason": "Welcome to SignBridge! Start with foundational fingerspelling.",
                "target_drill_signs": ["A", "B", "C"],
                "suggested_actions": ["Complete the first 5 alphabet letters in Observation Mode."]
            }

        # 1. Compute accuracy and identify weak signs (< 70%)
        total_acc = sum(item["accuracy"] for item in practice_history)
        avg_acc = total_acc / len(practice_history)

        weak_signs = [
            item["sign"] for item in practice_history 
            if item["accuracy"] < 0.70
        ]
        # Remove duplicates while preserving order
        unique_weak_signs = list(dict.fromkeys(weak_signs))

        # 2. Categorize predominant mistake types
        mistake_counts = {"hand_shape": 0, "motion": 0, "timing": 0}
        for item in practice_history:
            m_type = item.get("mistake_type", "hand_shape")
            if m_type in mistake_counts:
                mistake_counts[m_type] += 1

        predominant_mistake = max(mistake_counts, key=mistake_counts.get)

        # 3. Determine Adaptive Learning Path
        if avg_acc >= 0.85 and len(unique_weak_signs) <= 1:
            rec_course = "medical-terms"
            rec_title = "Medical Terms & Advanced Vocabulary"
            reason = f"Excellent foundation ({avg_acc*100:.1f}% accuracy)! You have cleared foundational ASL. We recommend advancing to professional communication."
            actions = ["Enroll in Medical Terms", "Practice two-handed compound signs"]
        elif avg_acc >= 0.75:
            rec_course = "family-home"
            rec_title = "Everyday Signs: Family & Home"
            reason = f"Strong consistency ({avg_acc*100:.1f}% accuracy). Ready to practice interactive conversational phrases."
            actions = ["Complete Family & Home module", "Focus on facial expression alignment"]
        else:
            rec_course = "basics-of-asl"
            rec_title = "Basics of ASL (Remedial Focus)"
            reason = f"Your average accuracy is {avg_acc*100:.1f}%. Detected difficulties with {predominant_mistake.replace('_', ' ')} alignment."
            actions = [
                f"Review anatomical hints for: {', '.join(unique_weak_signs[:3]) or 'Alphabet'}",
                "Practice holding each sign steadily for at least 2 seconds."
            ]

        # Determine Mastery Tier
        if avg_acc >= 0.90:
            level = "Mastery (Tier IV)"
        elif avg_acc >= 0.80:
            level = "Proficient (Tier III)"
        elif avg_acc >= 0.65:
            level = "Intermediate (Tier II)"
        else:
            level = "Beginner (Tier I)"

        return {
            "mastery_level": level,
            "overall_accuracy": round(avg_acc * 100, 1),
            "recommended_course_id": rec_course,
            "recommended_course_title": rec_title,
            "reason": reason,
            "target_drill_signs": unique_weak_signs[:4] if unique_weak_signs else ["A", "B"],
            "suggested_actions": actions
        }