import uuid
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


def _admin_headers():
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@signspeak.com", "password": "admin123"},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_reports_overview_empty_for_new_user():
    headers = _auth_headers()
    resp = client.get("/api/v1/reports/overview?range=30d", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["lessons_completed"] == 0
    assert data["practice_sessions"] == 0
    assert data["average_accuracy"] == 0.0
    assert data["has_data"] is False


def test_reports_overview_updates_after_activity():
    headers = _auth_headers()
    landmarks = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]

    # Submit a gesture attempt
    eval_resp = client.post(
        "/api/v1/assessment/evaluate",
        json={"expected_sign": "B", "landmarks": landmarks},
        headers=headers,
    )
    assert eval_resp.status_code == 200

    resp = client.get("/api/v1/reports/overview?range=30d", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["practice_sessions"] >= 1
    assert data["has_data"] is True


def test_reports_activity_chart():
    headers = _auth_headers()
    resp = client.get("/api/v1/reports/activity?range=7d", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 7
    assert "practice_attempts" in data[0]
    assert "learning_minutes" in data[0]


def test_reports_accuracy_trend():
    headers = _auth_headers()
    resp = client.get("/api/v1/reports/accuracy-trend?range=30d", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "points" in data
    assert "current_accuracy" in data
    assert "improvement_percent" in data


def test_reports_categories():
    headers = _auth_headers()
    landmarks = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]

    client.post(
        "/api/v1/assessment/evaluate",
        json={"expected_sign": "C", "landmarks": landmarks},
        headers=headers,
    )

    resp = client.get("/api/v1/reports/categories?range=30d", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    alphabet_cat = next((c for c in data if "Alphabet" in c["category"]), None)
    assert alphabet_cat is not None
    assert alphabet_cat["attempts"] >= 1


def test_reports_signs_mastery():
    headers = _auth_headers()
    landmarks = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]

    client.post(
        "/api/v1/assessment/evaluate",
        json={"expected_sign": "A", "landmarks": landmarks},
        headers=headers,
    )

    resp = client.get("/api/v1/reports/signs?range=30d", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "strongest_signs" in data
    assert "weakest_signs" in data
    assert data["total_signs_practiced"] >= 1


def test_reports_recent_activity():
    headers = _auth_headers()
    resp = client.get("/api/v1/reports/recent?limit=5", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_reports_export_csv():
    headers = _auth_headers()
    resp = client.get("/api/v1/reports/export?range=30d", headers=headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "SignSpeak AI Learning Platform" in resp.text
    assert "AI MODEL PERFORMANCE METRICS" in resp.text
    assert "LEARNER PERFORMANCE SUMMARY" in resp.text


def test_reports_model_performance_accessible_to_learner():
    headers = _auth_headers()
    resp = client.get("/api/v1/reports/model-performance", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["model_name"] == "RandomForestSignClassifier"
    assert data["test_samples"] == 348
    assert data["correct_predictions"] == 340
    assert data["incorrect_predictions"] == 8
    assert data["accuracy_percent"] == 97.7
    assert data["precision_percent"] == 98.03
    assert data["recall_percent"] == 97.7
    assert data["f1_percent"] == 97.76


def test_reports_admin_learners_access_control():
    learner_headers = _auth_headers()
    admin_headers = _admin_headers()

    # Learner should be 403 Forbidden
    forbidden_resp = client.get("/api/v1/reports/admin/learners", headers=learner_headers)
    assert forbidden_resp.status_code == 403

    # Admin should be 200 OK
    admin_resp = client.get("/api/v1/reports/admin/learners", headers=admin_headers)
    assert admin_resp.status_code == 200
    data = admin_resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
