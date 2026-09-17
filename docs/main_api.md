# SignSpeak — Backend API Gateway & Server Documentation (`main.py`)
**Infosys Springboard Internship 7.0 — Team 2**  
**Module:** Backend Architecture & API Services (Modules 1, 4, 8)  
**File:** `backend/main.py` (or `backend/app/main.py`)

---

## 1. Executive Summary

`main.py` serves as the central FastAPI application entry point for the SignSpeak platform. It is responsible for orchestrating cross-origin client requests, processing incoming video frame payloads, gating high-frequency motion artifacts, delegating gesture recognition to the computer vision pipeline, and exposing adaptive recommendation endpoints.

---

## 2. Server Architecture & Configuration

* **Framework:** FastAPI (Asynchronous ASGI server)
* **Server Runtime:** Uvicorn (`uvicorn main:app --reload --port 8000`)
* **CORS Middleware:** Configured with wildcard origins (`*`) during development, enabling requests from the React/Vite client (`http://localhost:5173`) and cloud deployments (Vercel).
* **Payload Handling:** Asynchronous binary stream ingestion using Python `multipart/form-data`.

---

## 3. API Endpoints Specification

### 3.1 Gesture Prediction Endpoint: `POST /predict`

Receives single-frame webcam captures from the learner client, verifies physical hand presence, computes motion delta, and validates against the curriculum target sign.

#### Request Schema:
| Parameter | Type | In | Description |
|---|---|---|---|
| `file` | `UploadFile` (Binary JPEG/PNG) | Form-Data | Raw frame captured via client webcam. |
| `target` | `str` | Form-Data | Current lesson identifier (e.g., `"A"`, `"D"`, `"M"`). |

#### Response Schema (`application/json`):
```json
{
  "prediction": "D",
  "confidence": 0.95,
  "is_moving": false,
  "landmarks": [
    { "x": 0.521, "y": 0.684, "z": -0.002 },
    ... 21 coordinates
  ],
  "hints": [
    "Only index finger should be extended upward."
  ]
}