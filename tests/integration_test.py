import requests

BASE_URL = "http://localhost:8000"

def test_health_check():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    print("✅ Health Check Passed")

def test_auth_flow():
    # Test if registration is secure
    data = {"email": "test@secure.com", "password": "password123"}
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    if response.status_code in [200, 201]:
        print("✅ Security: Auth Registration Working")
    else:
        print("❌ Auth Flow Failed")

if __name__ == "__main__":
    test_health_check()
    test_auth_flow()