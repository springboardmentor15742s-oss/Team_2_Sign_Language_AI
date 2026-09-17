from typing import List


def generate_learning_plan(
    accuracy: float,
    weak_signs: List[str],
    strong_signs: List[str],
    total_attempts: int,
) -> dict:
    """
    Generate a personalized learning plan based on
    learner performance.
    """

    # ------------------------------------------
    # Determine learner level
    # ------------------------------------------

    if accuracy >= 85:
        level = "Advanced"
        daily_goal = 15
        focus = "Maintain accuracy and improve consistency"

    elif accuracy >= 65:
        level = "Intermediate"
        daily_goal = 20
        focus = "Strengthen weak signs and reduce confusion"

    else:
        level = "Beginner"
        daily_goal = 25
        focus = "Build sign recognition fundamentals"

    # ------------------------------------------
    # Priority signs
    # ------------------------------------------

    priority_signs = weak_signs[:5]

    # ------------------------------------------
    # Practice recommendation
    # ------------------------------------------

    if priority_signs:
        practice_message = (
            "Focus on "
            + ", ".join(priority_signs)
            + " during your next practice session."
        )
    else:
        practice_message = (
            "Great progress. Continue practicing a balanced "
            "mix of previously learned signs."
        )

    # ------------------------------------------
    # Session plan
    # ------------------------------------------

    session_plan = [
        {
            "activity": "Warm-up",
            "duration_minutes": 5,
            "task": "Review familiar signs",
        },
        {
            "activity": "Focused Practice",
            "duration_minutes": 10,
            "task": (
                f"Practice priority signs: "
                f"{', '.join(priority_signs)}"
                if priority_signs
                else "Practice mixed ASL signs"
            ),
        },
        {
            "activity": "Recognition Challenge",
            "duration_minutes": 5,
            "task": "Test recognition without hints",
        },
    ]

    # ------------------------------------------
    # Improvement target
    # ------------------------------------------

    # Set a realistic progressive accuracy target.
    # Beginners start with at least 70%, while stronger
    # learners are challenged to improve by 10%.
    target_accuracy = min(
    max(round(accuracy + 10, 2), 70.0),
    95.0,
    )

    return {
        "learner_level": level,
        "current_accuracy": accuracy,
        "target_accuracy": target_accuracy,
        "total_attempts": total_attempts,
        "daily_practice_goal_minutes": daily_goal,
        "focus": focus,
        "priority_signs": priority_signs,
        "strong_signs": strong_signs[:5],
        "recommendation": practice_message,
        "session_plan": session_plan,
    }