# SignSpeak Course Catalogue Setup

The supplied project already has the course/lesson database models and learner enrollment APIs. The empty Courses screen was caused by an empty `courses` table, not by a missing frontend page.

This update adds a repeatable seed script based on the course categories specified in the project requirements:

- Beginner Sign Language
- Intermediate Sign Language
- Advanced Sign Language
- Everyday Communication
- Educational Vocabulary
- Professional Communication

It creates **6 published courses and 30 structured lessons**. The seed is idempotent and does not delete users, enrollments, or existing unrelated data.

## Run it

Open Command Prompt in the backend directory:

```bat
cd "E:\infosys springboard\frontend (1)\signspeak\backend"
venv\Scripts\activate
python scripts\seed_courses.py
```

If your current backend uses the `.env` shown in the project, make sure it contains:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=signspeak
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
FRONTEND_ORIGIN=http://localhost:5173
ENVIRONMENT=development
```

Then start/restart the backend:

```bat
uvicorn app.main:app --reload
```

Refresh `http://localhost:5173/courses` and the six courses should appear.

## Important

The seed script does not invent the project's AI gesture-recognition engine. It only supplies the course catalogue and lesson content needed by the existing course/enrollment workflow. AI practice, assessment intelligence, certification, and other modules remain subject to the backend capabilities documented in `BACKEND_PDF_AUDIT.md`.
