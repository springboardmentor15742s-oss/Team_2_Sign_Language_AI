# SignLearn Folder Responsibilities Matrix

| Directory | Scope | Primary Duty |
| :--- | :--- | :--- |
| `backend/app/api/v1/` | Backend | Public API version 1 routers (`health.py`, `router.py`). |
| `backend/app/routers/` | Backend | Internal endpoint handlers separated by feature domain. |
| `backend/app/services/` | Backend | Domain business logic and workflow orchestration. |
| `backend/app/repositories/` | Backend | Database persistence and query isolation. |
| `backend/app/models/` | Backend | SQLAlchemy BaseModel and entity definitions. |
| `backend/app/schemas/` | Backend | Pydantic request/response validation contracts. |
| `backend/app/dependencies/` | Backend | FastAPI dependency injection providers (`database.py`, `pagination.py`). |
| `backend/app/authentication/` | Backend | Auth scaffolding signatures (`jwt.py`, `password.py`, `oauth.py`). |
| `backend/app/ml/` | Backend | Computer vision AI model loading & MediaPipe landmark processing. |
| `frontend/app/` | Frontend | Next.js 15 App Router pages and layouts. |
| `frontend/components/ui/` | Frontend | Atomic UI components (`Button`, `Card`, `Typography`, `Modal`, `Table`). |
| `frontend/services/` | Frontend | Axios client, query hooks, and mutation wrappers. |
| `frontend/store/` | Frontend | Zustand state stores (`themeStore`, `authStore`). |
| `shared/` | Monorepo | Monorepo types, enums, constants, and interfaces. |
| `docker/` | DevOps | Multi-stage Dockerfiles and Nginx reverse proxy configuration. |
