# SignSpeak Backend — Access Control Update

This backend update was made against the supplied Sign Language Learning & Assessment Platform specification and the supplied React frontend.

## What was fixed

- Added server-side role-based access control for:
  - Learner (`student`)
  - Instructor
  - Accessibility Trainer
  - Administrator
- Public registration is learner-only; clients cannot self-register as admin/staff.
- Added protected admin user/role/status management.
- Added instructor ownership checks for course and lesson management.
- Added learner-only enrollment, lesson completion, practice sessions and assessment submission.
- Restricted assessment results and reports by role/ownership.
- Restricted notification access to the notification owner.
- Added OAuth2 password-flow token endpoint for Swagger-compatible clients.
- Added `/api` compatibility routes because the supplied React client defaults to `/api`, while the backend's canonical API is `/api/v1`.
- Restricted CORS to the configured frontend origin.
- Added production secret validation.
- Added `accessibility_trainer` database migration.
- Added PostgreSQL driver dependency and changed the example configuration to PostgreSQL, matching the project specification.
- Added an admin bootstrap script.

## Run

1. Create a virtual environment:
   `python -m venv venv`
2. Activate it on Windows:
   `venv\Scripts\activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set PostgreSQL credentials.
5. Run migrations:
   `alembic upgrade head`
6. Start:
   `uvicorn app.main:app --reload`

Swagger:
`http://127.0.0.1:8000/api/docs`

## First administrator

Register a normal learner account first, then run:

`python scripts/create_admin.py your-email@example.com`

After that, the admin can create/promote instructor and accessibility-trainer accounts through the protected admin API.

## Verification performed

- Python compilation of the application source completed successfully after the changes.
- Route coverage was inspected against the supplied frontend service calls.
- The backend now exposes both `/api/v1/...` and `/api/...` paths using the same authorization dependencies.
- A live database integration test could not be completed from this environment because the uploaded project's PostgreSQL native driver is not compatible with the current execution environment; `psycopg2-binary` is included in the updated requirements for a normal local setup.

## Scope note

The specification contains additional AI/gesture-recognition/certification/export modules. The supplied backend already contains several database models for these areas, but it did not contain complete API routers for every one of them. This update focuses on access control and the backend endpoints required by the supplied frontend, without inventing an AI inference implementation.
