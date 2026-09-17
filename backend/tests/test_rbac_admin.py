from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.database.database import SessionLocal
from app.models.user import User, RoleEnum
from app.core.security import hash_password


client = TestClient(app)

RUN_ID = uuid4().hex[:10]

LEARNER = {
    "full_name": "RBAC Test Learner",
    "email": f"rbac.learner.{RUN_ID}@example.com",
    "password": "TestPass123!",
    "role": "student",
}

ADMIN_EMAIL = f"rbac.admin.{RUN_ID}@example.com"
ADMIN_PASSWORD = "AdminPass123!"

learner_token = None
admin_token = None

instructor_id = None
trainer_id = None


def auth(token):
    return {
        "Authorization": f"Bearer {token}",
    }


def test_01_create_test_learner():
    global learner_token

    response = client.post(
        "/api/auth/register",
        json=LEARNER,
    )

    assert response.status_code == 201

    learner_token = response.json()["access_token"]

    assert learner_token


def test_02_seed_admin_account_and_login():
    global admin_token

    db = SessionLocal()

    try:
        admin = User(
            full_name="RBAC Test Admin",
            email=ADMIN_EMAIL,
            hashed_password=hash_password(
                ADMIN_PASSWORD
            ),
            role=RoleEnum.admin,
            is_active=True,
        )

        db.add(admin)
        db.commit()

    finally:
        db.close()

    response = client.post(
        "/api/auth/login",
        json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
        },
    )

    assert response.status_code == 200

    admin_token = response.json()["access_token"]

    assert admin_token


def test_03_learner_cannot_access_admin_dashboard():
    response = client.get(
        "/api/admin/dashboard",
        headers=auth(learner_token),
    )

    assert response.status_code == 403


def test_04_admin_can_access_dashboard():
    response = client.get(
        "/api/admin/dashboard",
        headers=auth(admin_token),
    )

    assert response.status_code == 200

    data = response.json()

    expected_fields = {
        "total_users",
        "active_users",
        "learners",
        "instructors",
        "accessibility_trainers",
        "courses",
        "lessons",
        "assessments",
    }

    assert expected_fields.issubset(data.keys())


def test_05_admin_can_list_users():
    response = client.get(
        "/api/admin/users",
        headers=auth(admin_token),
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)

    emails = [
        user["email"]
        for user in response.json()
    ]

    assert ADMIN_EMAIL in emails
    assert LEARNER["email"] in emails


def test_06_admin_can_create_instructor():
    global instructor_id

    response = client.post(
        "/api/admin/users",
        headers=auth(admin_token),
        json={
            "full_name": "RBAC Instructor",
            "email":
                f"rbac.instructor.{RUN_ID}@example.com",
            "password": "Instructor123!",
            "role": "instructor",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["role"] == "instructor"
    assert data["is_active"] is True

    instructor_id = data["id"]


def test_07_admin_can_create_accessibility_trainer():
    global trainer_id

    response = client.post(
        "/api/admin/users",
        headers=auth(admin_token),
        json={
            "full_name": "RBAC Accessibility Trainer",
            "email":
                f"rbac.trainer.{RUN_ID}@example.com",
            "password": "TrainerPass123!",
            "role": "accessibility_trainer",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["role"] == "accessibility_trainer"

    trainer_id = data["id"]


def test_08_instructor_cannot_access_admin_dashboard():
    email = f"rbac.instructor.{RUN_ID}@example.com"

    login = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "Instructor123!",
        },
    )

    assert login.status_code == 200

    token = login.json()["access_token"]

    response = client.get(
        "/api/admin/dashboard",
        headers=auth(token),
    )

    assert response.status_code == 403


def test_09_trainer_cannot_access_admin_dashboard():
    email = f"rbac.trainer.{RUN_ID}@example.com"

    login = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "TrainerPass123!",
        },
    )

    assert login.status_code == 200

    token = login.json()["access_token"]

    response = client.get(
        "/api/admin/dashboard",
        headers=auth(token),
    )

    assert response.status_code == 403


def test_10_admin_can_change_user_role():
    response = client.patch(
        f"/api/admin/users/{instructor_id}/role",
        headers=auth(admin_token),
        json={
            "role": "accessibility_trainer",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()["role"]
        == "accessibility_trainer"
    )


def test_11_admin_can_deactivate_user():
    response = client.patch(
        f"/api/admin/users/{trainer_id}/status",
        headers=auth(admin_token),
        json={
            "is_active": False,
        },
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_12_deactivated_user_cannot_login():
    response = client.post(
        "/api/auth/login",
        json={
            "email":
                f"rbac.trainer.{RUN_ID}@example.com",
            "password": "TrainerPass123!",
        },
    )

    assert response.status_code == 403


def test_13_admin_can_reactivate_user():
    response = client.patch(
        f"/api/admin/users/{trainer_id}/status",
        headers=auth(admin_token),
        json={
            "is_active": True,
        },
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is True


def test_14_admin_cannot_deactivate_self():
    me = client.get(
        "/api/auth/me",
        headers=auth(admin_token),
    )

    assert me.status_code == 200

    admin_id = me.json()["id"]

    response = client.patch(
        f"/api/admin/users/{admin_id}/status",
        headers=auth(admin_token),
        json={
            "is_active": False,
        },
    )

    assert response.status_code == 400
