import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"detail": err_body}
        return e.code, parsed

def test_auth():
    # 1. Test Learner Login
    print("1. Testing Learner Login...")
    status, learner_data = api_request("/auth/login", method="POST", data={
        "email": "student@signspeak.com",
        "password": "student123"
    })
    print(f"Learner login status: {status}")
    print(f"Learner role: {learner_data.get('user', {}).get('role')}")
    learner_token = learner_data.get("access_token")

    # 2. Test Learner attempting to access Admin API (MUST be 403 Forbidden)
    print("\n2. Testing Learner access to /admin/dashboard (Should be 403 Forbidden)...")
    status, forbidden_data = api_request("/admin/dashboard", method="GET", token=learner_token)
    print(f"Learner admin access status: {status} (Expected: 403, detail: {forbidden_data.get('detail')})")

    # 3. Test Admin Login
    print("\n3. Testing Admin Login...")
    status, admin_data = api_request("/auth/login", method="POST", data={
        "email": "admin@signspeak.com",
        "password": "admin123"
    })
    print(f"Admin login status: {status}")
    print(f"Admin role: {admin_data.get('user', {}).get('role')}")
    admin_token = admin_data.get("access_token")

    # 4. Test Admin accessing Admin API (MUST be 200 OK)
    print("\n4. Testing Admin access to /admin/dashboard (Should be 200 OK)...")
    status, admin_dash = api_request("/admin/dashboard", method="GET", token=admin_token)
    print(f"Admin dashboard status: {status}")
    print(f"Admin dashboard metrics: {admin_dash}")

    # 5. Test Invalid Credentials
    print("\n5. Testing Invalid Credentials (Should be 401 Unauthorized)...")
    status, invalid_data = api_request("/auth/login", method="POST", data={
        "email": "admin@signspeak.com",
        "password": "wrongpassword"
    })
    print(f"Invalid login status: {status} (Expected: 401, detail: {invalid_data.get('detail')})")

if __name__ == "__main__":
    test_auth()
