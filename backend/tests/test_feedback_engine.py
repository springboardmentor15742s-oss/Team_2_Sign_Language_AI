from app.services.feedback_service import FeedbackEngine


def test_feedback_no_hand():
    engine = FeedbackEngine()
    result = engine.generate(
        expected_sign="A", predicted_sign="None", is_correct=False, confidence=0.0,
        score=0.0, status="no_hand", hand_detected=False,
    )
    assert result.category == "hand_not_detected"
    assert result.status == "no_hand"


def test_feedback_quality_issue_blocks_scoring():
    engine = FeedbackEngine()
    quality = {"passed": False, "issues": [
        {"code": "hand_too_close", "message": "Move back slightly.", "severity": "error"},
    ]}
    result = engine.generate(
        expected_sign="A", predicted_sign="None", is_correct=False, confidence=0.0,
        score=0.0, status="quality_issue", hand_detected=True, quality=quality,
    )
    assert result.category == "hand_too_close"
    assert result.score == 0.0


def test_feedback_low_confidence_not_labeled_incorrect_message():
    engine = FeedbackEngine()
    result = engine.generate(
        expected_sign="A", predicted_sign="B", is_correct=False, confidence=0.2,
        score=5.0, status="low_confidence", hand_detected=True,
    )
    assert "Unable to confidently recognize" in result.feedback_message
    assert "Incorrect" not in result.feedback_message


def test_feedback_correct_high_confidence():
    engine = FeedbackEngine()
    result = engine.generate(
        expected_sign="B", predicted_sign="B", is_correct=True, confidence=0.95,
        score=98.0, status="success", hand_detected=True,
    )
    assert result.category == "correct_high_confidence"
    assert "Excellent" in result.feedback_message


def test_feedback_repeated_mistake_detected():
    engine = FeedbackEngine()
    previous = [{"is_correct": False, "confidence": 0.5}, {"is_correct": False, "confidence": 0.4}]
    result = engine.generate(
        expected_sign="D", predicted_sign="G", is_correct=False, confidence=0.8,
        score=10.0, status="success", hand_detected=True, previous_attempts=previous,
    )
    assert result.category == "repeated_mistake"
    assert result.improvement["repeated_mistake"] is True


def test_feedback_improvement_detected():
    engine = FeedbackEngine()
    previous = [{"is_correct": True, "confidence": 0.65}]
    result = engine.generate(
        expected_sign="C", predicted_sign="C", is_correct=True, confidence=0.85,
        score=90.0, status="success", hand_detected=True, previous_attempts=previous,
    )
    assert result.improvement["improving"] is True
    assert "improvement" in result.feedback_message.lower()
