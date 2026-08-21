import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _auth_headers():
    email = f"test_{uuid.uuid4().hex[:10]}@signspeak-qa.com"
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test Learner", "email": email, "password": "TestPass123!"},
    )
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_predict_endpoint_requires_auth():
    response = client.post("/api/v1/assessment/predict", json={"landmarks": [[0.0, 0.0, 0.0]] * 21})
    assert response.status_code == 401


def test_predict_endpoint_no_data():
    headers = _auth_headers()
    response = client.post("/api/v1/assessment/predict", json={}, headers=headers)
    assert response.status_code == 400


def test_predict_endpoint_valid_landmarks():
    headers = _auth_headers()
    sample_landmarks = [[float(i * 0.05), float(i * 0.02), 0.0] for i in range(21)]
    response = client.post("/api/v1/assessment/predict", json={"landmarks": sample_landmarks}, headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert "predicted_sign" in data
    assert "confidence" in data
    assert "hand_detected" in data
    assert data["hand_detected"] is True


def test_assessment_classes_endpoint():
    headers = _auth_headers()
    response = client.get("/api/v1/assessment/classes", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "A" in data["classes"]
    assert data["count"] == len(data["classes"])


def test_assessment_questions_alphabet():
    headers = _auth_headers()
    response = client.get("/api/v1/assessment/questions?type=alphabet&count=5", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["assessment_type"] == "alphabet"
    assert len(data["questions"]) == 5
    signs = [q["target_sign"] for q in data["questions"]]
    assert len(set(signs)) == len(signs)  # alphabet mode samples without replacement


def test_assessment_questions_invalid_type():
    headers = _auth_headers()
    response = client.get("/api/v1/assessment/questions?type=bogus", headers=headers)
    assert response.status_code == 400


def test_assessment_progress_empty_for_new_user():
    headers = _auth_headers()
    response = client.get("/api/v1/assessment/progress", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_attempts"] == 0
    assert data["overall_accuracy"] == 0.0


def test_evaluation_endpoints_require_staff_role():
    headers = _auth_headers()  # default role is "student" (learner)
    response = client.get("/api/v1/evaluation/model", headers=headers)
    assert response.status_code == 403


def _admin_headers():
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@signspeak.com", "password": "admin123"},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_evaluation_model_accessible_to_admin():
    headers = _admin_headers()
    response = client.get("/api/v1/evaluation/model", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "model_version" in data


def test_model_comparison_endpoint_accessible_to_admin():
    headers = _admin_headers()
    response = client.get("/api/v1/evaluation/models/compare", headers=headers)
    assert response.status_code == 200
    assert "models" in response.json()


def test_evaluate_and_submit_session_round_trip():
    headers = _auth_headers()
    sample_landmarks = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]

    attempt_ids = []
    for _ in range(2):
        resp = client.post(
            "/api/v1/assessment/evaluate",
            json={"expected_sign": "A", "landmarks": sample_landmarks},
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "attempt_id" in data
        assert data["status"] in {"success", "low_confidence"}
        attempt_ids.append(data["attempt_id"])

    submit_resp = client.post(
        "/api/v1/assessment/submit",
        json={"assessment_type": "quiz", "attempt_ids": attempt_ids},
        headers=headers,
    )
    assert submit_resp.status_code == 200, submit_resp.text
    session = submit_resp.json()
    assert session["total_questions"] == 2
    assert session["correct_count"] + session["incorrect_count"] == 2

    session_resp = client.get(f"/api/v1/assessment/sessions/{session['id']}", headers=headers)
    assert session_resp.status_code == 200
    assert len(session_resp.json()["attempts"]) == 2
