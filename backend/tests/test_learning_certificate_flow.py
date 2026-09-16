from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

TEST_USER = {
    "full_name": "Certificate Flow Learner",
    "email": f"certificate.flow.{uuid4().hex[:10]}@example.com",
    "password": "TestPass123!",
    "role": "student",
}

token = None
course_id = None
lesson_ids = []


def auth_headers():
    return {
        "Authorization": f"Bearer {token}",
    }


def test_01_register_test_learner():
    global token

    response = client.post(
        "/api/auth/register",
        json=TEST_USER,
    )

    assert response.status_code == 201

    data = response.json()

    token = data["access_token"]

    assert token
    assert data["user"]["role"] == "student"


def test_02_get_published_courses():
    global course_id

    response = client.get(
        "/api/courses",
        headers=auth_headers(),
    )

    assert response.status_code == 200

    courses = response.json()

    assert isinstance(courses, list)
    assert len(courses) > 0

    course_id = courses[0]["id"]

    assert course_id is not None


def test_03_enroll_in_course():
    response = client.post(
        f"/api/courses/{course_id}/enroll",
        headers=auth_headers(),
    )

    assert response.status_code == 201

    enrollment = response.json()

    assert enrollment["course_id"] == course_id
    assert enrollment["progress_percent"] == 0


def test_04_enrollment_is_visible():
    response = client.get(
        "/api/courses/enrolled",
        headers=auth_headers(),
    )

    assert response.status_code == 200

    enrollments = response.json()

    matching = [
        item
        for item in enrollments
        if item["course"]["id"] == course_id
    ]

    assert len(matching) == 1
    assert matching[0]["progress_percent"] == 0


def test_05_get_course_lessons():
    global lesson_ids

    response = client.get(
        f"/api/courses/{course_id}/lessons",
        headers=auth_headers(),
    )

    assert response.status_code == 200

    lessons = response.json()

    assert isinstance(lessons, list)
    assert len(lessons) > 0

    lesson_ids = [
        lesson["id"]
        for lesson in lessons
    ]


def test_06_complete_every_lesson():
    assert lesson_ids

    for lesson_id in lesson_ids:
        response = client.post(
            f"/api/lessons/{lesson_id}/complete",
            headers=auth_headers(),
        )

        assert response.status_code == 200


def test_07_course_reaches_100_percent():
    response = client.get(
        "/api/courses/enrolled",
        headers=auth_headers(),
    )

    assert response.status_code == 200

    enrollments = response.json()

    enrollment = next(
        item
        for item in enrollments
        if item["course"]["id"] == course_id
    )

    assert enrollment["progress_percent"] == 100
    assert enrollment["completed_at"] is not None


def test_08_generate_certificate():
    response = client.post(
        f"/api/certificates/course/{course_id}/generate",
        headers=auth_headers(),
    )

    assert response.status_code in (200, 201)

    data = response.json()

    assert "certificate" in data

    certificate = data["certificate"]

    assert certificate["course_id"] == course_id
    assert certificate["certificate_number"]
    assert certificate["title"]
    assert certificate["issued_at"]


def test_09_certificate_appears_in_certificate_center():
    response = client.get(
        "/api/certificates",
        headers=auth_headers(),
    )

    assert response.status_code == 200

    certificates = response.json()

    assert isinstance(certificates, list)

    matching = [
        certificate
        for certificate in certificates
        if certificate["course_id"] == course_id
    ]

    assert len(matching) == 1


def test_10_certificate_generation_is_idempotent():
    first = client.post(
        f"/api/certificates/course/{course_id}/generate",
        headers=auth_headers(),
    )

    second = client.post(
        f"/api/certificates/course/{course_id}/generate",
        headers=auth_headers(),
    )

    assert first.status_code in (200, 201)
    assert second.status_code in (200, 201)

    first_data = first.json()
    second_data = second.json()

    assert "certificate" in first_data
    assert "certificate" in second_data

    first_certificate = first_data["certificate"]
    second_certificate = second_data["certificate"]

    assert (
        first_certificate["certificate_number"]
        == second_certificate["certificate_number"]
    )


def test_11_reports_work_after_course_completion():
    endpoints = [
        "/api/reports/progress",
        "/api/reports/learning",
        "/api/reports/sign-performance",
    ]

    for endpoint in endpoints:
        response = client.get(
            endpoint,
            headers=auth_headers(),
        )

        assert response.status_code < 500, (
            f"{endpoint} crashed with "
            f"{response.status_code}: {response.text}"
        )
