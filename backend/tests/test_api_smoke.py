import os

import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()

    assert data.get("status") == "healthy"


def test_openapi_available():
    response = client.get("/api/openapi.json")

    assert response.status_code == 200

    schema = response.json()

    assert "paths" in schema
    assert "/api/health" in schema["paths"]


@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/courses",
        "/api/assessments",
    ],
)
def test_public_core_routes_do_not_crash(endpoint):
    response = client.get(endpoint)

    assert response.status_code < 500


@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/reports/sign-performance",
        "/api/practice/sessions",
        "/api/certificates",
    ],
)
def test_protected_routes_require_authentication(endpoint):
    response = client.get(endpoint)

    assert response.status_code in (401, 403)


def test_ml_learning_plan_route_exists():
    response = client.post(
        "/api/v1/ml/learning-plan",
        json={
            "accuracy": 60,
            "weakSigns": ["A", "B"],
            "strongSigns": ["C"],
            "totalAttempts": 10,
        },
    )

    # The purpose of this smoke test is to verify
    # that the route exists and does not crash.
    assert response.status_code != 404
    assert response.status_code < 500


def test_certificate_generation_requires_authentication():
    response = client.post(
        "/api/certificates/course/1/generate"
    )

    assert response.status_code in (401, 403)
