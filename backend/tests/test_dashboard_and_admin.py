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


def test_dashboard_stats_empty_for_new_user():
    headers = _auth_headers()
    resp = client.get("/api/v1/dashboard/stats", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_xp"] == 0
    assert data["current_streak"] == 0
    assert data["assessments_completed"] == 0
    assert data["recent_activity"] == []
    assert len(data["weekly_activity"]) == 7


def test_xp_and_streak_awarded_on_evaluate():
    headers = _auth_headers()
    landmarks = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]

    resp = client.post(
        "/api/v1/assessment/evaluate",
        json={"expected_sign": "A", "landmarks": landmarks},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["xp_awarded"] > 0
    assert "landmarks" in data

    stats = client.get("/api/v1/dashboard/stats", headers=headers).json()
    assert stats["total_xp"] == data["xp_awarded"]
    assert stats["current_streak"] == 1
    assert stats["total_answers"] == 1


def test_achievements_list_requires_auth():
    resp = client.get("/api/v1/dashboard/achievements")
    assert resp.status_code == 401


def test_achievements_list_returns_all_definitions_locked_for_new_user():
    headers = _auth_headers()
    resp = client.get("/api/v1/dashboard/achievements", headers=headers)
    assert resp.status_code == 200
    achievements = resp.json()
    assert len(achievements) >= 6
    assert all(a["unlocked"] is False for a in achievements)
    assert all("title" in a and "xp_reward" in a for a in achievements)


def test_dashboard_stats_requires_auth():
    resp = client.get("/api/v1/dashboard/stats")
    assert resp.status_code == 401


def test_admin_users_activity_requires_admin_role():
    headers = _auth_headers()
    resp = client.get("/api/v1/admin/users/activity", headers=headers)
    assert resp.status_code == 403


def test_admin_users_activity_accessible_to_admin():
    headers = _admin_headers()
    resp = client.get("/api/v1/admin/users/activity", headers=headers)
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) > 0
    assert "accuracy" in users[0]
    assert "last_login_at" in users[0]


def test_admin_activity_log_requires_admin_role():
    headers = _auth_headers()
    resp = client.get("/api/v1/admin/activity", headers=headers)
    assert resp.status_code == 403


def test_evaluate_burst_majority_vote():
    headers = _auth_headers()
    landmarks = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]
    frame = f"data:image/png;base64,{'A' * 40}"  # not a real image; frames path falls back gracefully

    resp = client.post(
        "/api/v1/assessment/evaluate",
        json={"expected_sign": "A", "landmarks": landmarks},
        headers=headers,
    )
    assert resp.status_code == 200

    # Burst path with unusable image frames should still respond with a
    # coherent (no-hand) result rather than erroring out.
    resp2 = client.post(
        "/api/v1/assessment/evaluate",
        json={"expected_sign": "A", "frames": [frame, frame, frame]},
        headers=headers,
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["status"] in {"no_hand", "quality_issue"}
    assert data2["attempt_id"] is not None


def test_admin_activity_log_records_login():
    headers = _admin_headers()
    resp = client.get("/api/v1/admin/activity?limit=5", headers=headers)
    assert resp.status_code == 200
    rows = resp.json()
    assert any(r["action"] == "LOGIN" for r in rows)
