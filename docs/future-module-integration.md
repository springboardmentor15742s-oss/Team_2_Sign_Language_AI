# SignLearn Future Module Integration Guide

This guide outlines how upcoming modules (Phase 2-5) plug directly into the Phase 1 scaffold.

---

## 1. Authentication & Learner Profile (Phase 2)
1. **Models**: Create `backend/app/models/user.py` and `profile.py` inheriting `BaseModel`.
2. **Schemas**: Define Pydantic request models in `backend/app/schemas/auth.py`.
3. **Authentication**: Fill in implementations inside `backend/app/authentication/jwt.py` and `password.py`.
4. **Router**: Add `backend/app/routers/auth.py` and include in `backend/app/api/v1/router.py`.
5. **Frontend**: Connect `frontend/store/authStore.ts` and `frontend/services/api/auth.ts`.

---

## 2. AI Gesture Recognition Engine (Phase 3)
1. **MediaPipe Vision**: Install `@mediapipe/camera_utils` & `@mediapipe/hands` in `frontend/`.
2. **ML Backend**: Implement landmark spatial classification pipelines under `backend/app/ml/gestures/`.
3. **Socket Stream**: Create WebSocket endpoint under `backend/app/api/v1/gesture_ws.py`.

---

## 3. Assessments & Certificates (Phase 4)
1. **Repositories**: Add `backend/app/repositories/assessment_repository.py`.
2. **Certificates**: Generate PDF certificates and store metadata in PostgreSQL `certificates` table.
