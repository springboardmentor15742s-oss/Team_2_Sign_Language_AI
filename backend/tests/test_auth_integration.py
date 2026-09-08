from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


# A unique account is used for every test run so repeated
# executions do not conflict with existing database users.
TEST_ID = uuid4().hex[:10]

TEST_USER = {
    "full_name": "SignSpeak Test Learner",
    "email": f"signspeak.test.{TEST_ID}@example.com",
    "password": "TestPass123!",
    "role": "student",
}


def test_01_register_learner():
    response = client.post(
        "/api/auth/register",
        json=TEST_USER,
    )

    assert response.status_code == 201

    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert "user" in data

    assert data["user"]["email"] == TEST_USER["email"]
    assert data["user"]["full_name"] == TEST_USER["full_name"]
    assert data["user"]["role"] == "student"
    assert data["user"]["is_active"] is True


def test_02_duplicate_registration_is_rejected():
    response = client.post(
        "/api/auth/register",
        json=TEST_USER,
    )

    assert response.status_code == 400

    data = response.json()

    assert data["detail"] == "Email is already registered"


def test_03_login_returns_tokens():
    response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data.get("access_token")
    assert data.get("refresh_token")

    assert data["user"]["email"] == TEST_USER["email"]
    assert data["user"]["role"] == "student"


def test_04_wrong_password_is_rejected():
    response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": "DefinitelyWrong123!",
        },
    )

    assert response.status_code == 401


def test_05_authenticated_me_endpoint():
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    user = response.json()

    assert user["email"] == TEST_USER["email"]
    assert user["full_name"] == TEST_USER["full_name"]
    assert user["role"] == "student"


def test_06_protected_report_access_with_token():
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/reports/sign-performance",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    # An authenticated learner should be allowed to request
    # their own performance report even with no activity yet.
    assert response.status_code == 200

    data = response.json()

    assert "user_id" in data
    assert "total_sessions" in data
    assert "total_detection_attempts" in data
    assert "weak_signs" in data
    assert "strong_signs" in data


def test_07_refresh_token_generates_access_token():
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        },
    )

    assert login_response.status_code == 200

    refresh_token = login_response.json()["refresh_token"]

    response = client.post(
        "/api/auth/refresh",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data.get("access_token")


def test_08_authenticated_logout():
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        },
    )

    token = login_response.json()["access_token"]

    response = client.post(
        "/api/auth/logout",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()["message"]
        == "Logged out successfully"
    )


def test_09_public_registration_cannot_create_admin():
    unique_admin_email = (
        f"blocked.admin.{uuid4().hex[:10]}@example.com"
    )

    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Blocked Admin",
            "email": unique_admin_email,
            "password": "TestPass123!",
            "role": "admin",
        },
    )

    assert response.status_code == 403

    assert (
        response.json()["detail"]
        == "Public registration is restricted to learner accounts"
    )
