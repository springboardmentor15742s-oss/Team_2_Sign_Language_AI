import json
import urllib.request

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def test_reports():
    # 1. Login as Student
    status, student_auth = api_request("/auth/login", method="POST", data={
        "email": "student@signspeak.com",
        "password": "student123"
    })
    print(f"Student Login: {status}")
    token = student_auth["access_token"]

    # 2. Get Overview
    status, overview = api_request("/reports/overview?range=30d", token=token)
    print(f"Overview API: {status}")
    print(f"  Lessons Completed: {overview['lessons_completed']}")
    print(f"  Practice Sessions: {overview['practice_sessions']}")
    print(f"  Average Accuracy: {overview['average_accuracy']}%")
    print(f"  Learning Time: {overview['learning_time_display']}")

    # 3. Get Activity
    status, activity = api_request("/reports/activity?range=7d", token=token)
    print(f"Activity Timeline API: {status}, Total days: {len(activity)}")

    # 4. Get Accuracy Trend
    status, trend = api_request("/reports/accuracy-trend?range=30d", token=token)
    print(f"Accuracy Trend API: {status}, Current: {trend['current_accuracy']}%, Points: {len(trend['points'])}")

    # 5. Get Categories
    status, cats = api_request("/reports/categories?range=30d", token=token)
    print(f"Categories API: {status}, Categories: {[c['category'] for c in cats]}")

    # 6. Get Signs Mastery
    status, signs = api_request("/reports/signs?range=30d", token=token)
    print(f"Sign Mastery API: {status}, Practiced Signs Count: {signs['total_signs_practiced']}")

    # 7. Get Recent Activity
    status, recent = api_request("/reports/recent?limit=5", token=token)
    print(f"Recent Activity API: {status}, Event Count: {len(recent)}")

    print("\nAll Reports & Analytics endpoints verified successfully!")

if __name__ == "__main__":
    test_reports()
