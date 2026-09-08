from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.database.database import SessionLocal
from app.models.notification import Notification, NotificationTypeEnum
from app.models.user import User


client = TestClient(app)

RUN_ID = uuid4().hex[:10]

USER = {
    "full_name": "Account Test Learner",
    "email": f"account.test.{RUN_ID}@example.com",
    "password": "TestPass123!",
    "role": "student",
}

token = None
user_id = None
notification_id = None


def headers():
    return {
        "Authorization": f"Bearer {token}",
    }


def test_01_register_account_test_user():
    global token, user_id

    response = client.post(
        "/api/auth/register",
        json=USER,
    )

    assert response.status_code == 201

    data = response.json()

    token = data["access_token"]
    user_id = data["user"]["id"]

    assert token
    assert user_id


def test_02_get_profile():
    response = client.get(
        "/api/users/profile",
        headers=headers(),
    )

    assert response.status_code == 200

    profile = response.json()

    assert profile["email"] == USER["email"]
    assert profile["full_name"] == USER["full_name"]


def test_03_update_profile():
    response = client.put(
        "/api/users/profile",
        headers=headers(),
        json={
            "full_name": "Updated Account Learner",
            "bio": "Testing SignSpeak account workflow.",
            "location": "Coimbatore",
            "preferred_language": "ASL",
            "learning_level": "intermediate",
            "learning_goals": [
                "Daily Conversation",
                "Accessibility & Inclusion",
            ],
        },
    )

    assert response.status_code == 200

    profile = response.json()

    assert profile["full_name"] == "Updated Account Learner"
    assert profile["bio"] == "Testing SignSpeak account workflow."
    assert profile["location"] == "Coimbatore"
    assert profile["preferred_language"] == "ASL"
    assert profile["learning_level"] == "intermediate"

    assert "Daily Conversation" in profile["learning_goals"]


def test_04_profile_update_is_persistent():
    response = client.get(
        "/api/users/profile",
        headers=headers(),
    )

    assert response.status_code == 200

    profile = response.json()

    assert profile["full_name"] == "Updated Account Learner"
    assert profile["location"] == "Coimbatore"


def test_05_wrong_current_password_is_rejected():
    response = client.put(
        "/api/users/password",
        headers=headers(),
        json={
            "current_password": "WrongPassword123!",
            "new_password": "NewPass123!",
        },
    )

    assert response.status_code == 400


def test_06_change_password():
    response = client.put(
        "/api/users/password",
        headers=headers(),
        json={
            "current_password": USER["password"],
            "new_password": "NewPass123!",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()["message"]
        == "Password updated successfully"
    )


def test_07_old_password_no_longer_works():
    response = client.post(
        "/api/auth/login",
        json={
            "email": USER["email"],
            "password": USER["password"],
        },
    )

    assert response.status_code == 401


def test_08_new_password_works():
    global token

    response = client.post(
        "/api/auth/login",
        json={
            "email": USER["email"],
            "password": "NewPass123!",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    assert token


def test_09_seed_notification():
    global notification_id

    db = SessionLocal()

    try:
        user = db.get(User, user_id)

        assert user is not None

        notification = Notification(
            user_id=user_id,
            title="Practice Reminder",
            message="Complete your SignSpeak practice session.",
            type=NotificationTypeEnum.course,
            is_read=False,
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        notification_id = notification.id

    finally:
        db.close()

    assert notification_id


def test_10_get_notifications():
    response = client.get(
        "/api/notifications",
        headers=headers(),
    )

    assert response.status_code == 200

    notifications = response.json()

    matching = [
        item
        for item in notifications
        if item["id"] == notification_id
    ]

    assert len(matching) == 1
    assert matching[0]["is_read"] is False


def test_11_mark_notification_read():
    response = client.patch(
        f"/api/notifications/{notification_id}/read",
        headers=headers(),
    )

    assert response.status_code == 200

    assert response.json()["is_read"] is True


def test_12_mark_all_notifications_read():
    response = client.patch(
        "/api/notifications/read-all",
        headers=headers(),
    )

    assert response.status_code == 200

    assert (
        response.json()["message"]
        == "Notifications marked as read"
    )


def test_13_delete_notification():
    response = client.delete(
        f"/api/notifications/{notification_id}",
        headers=headers(),
    )

    assert response.status_code == 204


def test_14_deleted_notification_is_gone():
    response = client.get(
        "/api/notifications",
        headers=headers(),
    )

    assert response.status_code == 200

    ids = [
        item["id"]
        for item in response.json()
    ]

    assert notification_id not in ids
