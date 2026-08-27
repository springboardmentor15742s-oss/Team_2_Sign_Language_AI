# SignSpeak Learning Intelligence Service

# Commonly confused ASL signs based on model evaluation
CONFUSION_GROUPS = {
    "U": ["V", "W", "R"],
    "V": ["U", "W", "X"],
    "W": ["V", "U"],
    "M": ["N"],
    "N": ["M"],
    "R": ["S", "U"],
    "S": ["R", "T"],
    "T": ["S"],
    "X": ["Y", "V"],
    "Y": ["X"],
}


def generate_learning_intelligence(
    predicted_sign: str,
    confidence: float
) -> dict:
    """
    Generate AI-based feedback and recommendations
    from the model prediction.
    """

    # Determine learner status
    if confidence >= 85:
        learning_status = "good"
        feedback = "Strong prediction confidence."

    elif confidence >= 60:
        learning_status = "needs_practice"
        feedback = (
            "Moderate prediction confidence. "
            "More practice is recommended."
        )

    else:
        learning_status = "needs_review"
        feedback = (
            "Low prediction confidence. "
            "Review this sign and try again."
        )

    # Find signs commonly confused with prediction
    similar_signs = CONFUSION_GROUPS.get(
        predicted_sign,
        []
    )

    # Generate personalized recommendation
    if similar_signs:
        recommendation = (
            f"Practice sign {predicted_sign} together with "
            f"{', '.join(similar_signs)} to improve distinction."
        )

    else:
        recommendation = (
            f"Continue practicing sign {predicted_sign} "
            "using different hand positions and lighting conditions."
        )

    return {
        "learning_status": learning_status,
        "feedback": feedback,
        "recommendation": recommendation,
        "similar_signs": similar_signs,
    }