from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

TEST_USER = {
    "full_name": "Reporting Validation Learner",
    "email": f"report.validation.{uuid4().hex[:10]}@example.com",
    "password": "TestPass123!",
    "role": "student",
}

access_token = None
session_id = None


def headers():
    return {
        "Authorization": f"Bearer {access_token}",
    }


def test_01_register_reporting_test_user():
    global access_token

    response = client.post(
        "/api/auth/register",
        json=TEST_USER,
    )

    assert response.status_code == 201

    data = response.json()

    access_token = data["access_token"]

    assert access_token


def test_02_create_practice_session():
    global session_id

    response = client.post(
        "/api/practice/sessions",
        headers=headers(),
        json={
            "lesson_id": None,
            "target_gesture": "A",
        },
    )

    assert response.status_code == 200

    data = response.json()

    session_id = data["id"]

    assert session_id is not None


def test_03_finish_session_with_controlled_sample_data():
    response = client.patch(
        f"/api/practice/sessions/{session_id}",
        headers=headers(),
        json={
            "duration_seconds": 120,
            "average_confidence": 0.88,
            "attempts": 5,
            "successful_attempts": 4,
            "detections": [
                {
                    "target_gesture": "A",
                    "predicted_gesture": "A",
                    "confidence": 0.90,
                    "correct": True,
                },
                {
                    "target_gesture": "A",
                    "predicted_gesture": "A",
                    "confidence": 0.85,
                    "correct": True,
                },
                {
                    "target_gesture": "A",
                    "predicted_gesture": "M",
                    "confidence": 0.80,
                    "correct": False,
                },
                {
                    "target_gesture": "B",
                    "predicted_gesture": "B",
                    "confidence": 0.92,
                    "correct": True,
                },
                {
                    "target_gesture": "B",
                    "predicted_gesture": "B",
                    "confidence": 0.93,
                    "correct": True,
                },
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["attempts"] == 5
    assert data["successful_attempts"] == 4
    assert data["average_confidence"] == 0.88


def test_04_accuracy_report_calculation():
    response = client.get(
        "/api/reports/accuracy",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    assert report["sessions"] == 1
    assert report["attempts"] == 5
    assert report["successful_attempts"] == 4

    # 4 / 5 * 100 = 80%
    assert report["accuracy_percent"] == 80.0

    # Only one session, so report average must equal session average.
    assert report["average_confidence"] == 0.88


def test_05_progress_report_counts_practice_session():
    response = client.get(
        "/api/reports/progress",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    assert report["practice_sessions"] == 1
    assert report["lessons_completed"] == 0


def test_06_sign_performance_total_math():
    response = client.get(
        "/api/reports/sign-performance",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    assert report["total_sessions"] == 1
    assert report["total_detection_attempts"] == 5
    assert report["total_correct"] == 4

    # 4 / 5 * 100 = 80%
    assert report["overall_accuracy_percent"] == 80.0


def test_07_sign_a_accuracy_is_correct():
    response = client.get(
        "/api/reports/sign-performance",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    sign_a = next(
        item
        for item in report["signs"]
        if item["sign"] == "A"
    )

    assert sign_a["attempts"] == 3
    assert sign_a["correct"] == 2
    assert sign_a["incorrect"] == 1

    # 2 / 3 = 66.67%
    assert sign_a["accuracy_percent"] == 66.67

    # (0.90 + 0.85 + 0.80) / 3 = 0.85
    assert sign_a["average_confidence"] == 0.85


def test_08_sign_b_accuracy_is_correct():
    response = client.get(
        "/api/reports/sign-performance",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    sign_b = next(
        item
        for item in report["signs"]
        if item["sign"] == "B"
    )

    assert sign_b["attempts"] == 2
    assert sign_b["correct"] == 2
    assert sign_b["incorrect"] == 0

    assert sign_b["accuracy_percent"] == 100.0

    # (0.92 + 0.93) / 2
    assert sign_b["average_confidence"] == 0.93


def test_09_weak_and_strong_sign_classification():
    response = client.get(
        "/api/reports/sign-performance",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    # A = 66.67%, therefore weak (<70%)
    assert "A" in report["weak_signs"]

    # B = 100%, therefore strong (>=80%)
    assert "B" in report["strong_signs"]

    assert "B" not in report["weak_signs"]


def test_10_confusion_analysis_is_correct():
    response = client.get(
        "/api/reports/sign-performance",
        headers=headers(),
    )

    assert response.status_code == 200

    report = response.json()

    confusion = next(
        (
            item
            for item in report["confusions"]
            if item["expected"] == "A"
            and item["predicted"] == "M"
        ),
        None,
    )

    assert confusion is not None
    assert confusion["count"] == 1


def test_11_learning_and_assessment_empty_state_is_valid():
    learning = client.get(
        "/api/reports/learning",
        headers=headers(),
    )

    assessment = client.get(
        "/api/reports/assessment",
        headers=headers(),
    )

    assert learning.status_code == 200
    assert assessment.status_code == 200

    learning_data = learning.json()
    assessment_data = assessment.json()

    assert learning_data["courses"] == []

    assert assessment_data["attempts"] == 0
    assert assessment_data["average_score"] == 0
    assert assessment_data["passed"] == 0
