# SignSpeak — AI-Powered Sign Language Learning & Assessment Platform

A production-ready platform for learning sign language with AI-powered practice and assessment.

## Project Structure

```
project-root/
├── frontend/     React 19 + Vite + Tailwind CSS
├── backend/      FastAPI + PostgreSQL + SQLAlchemy
├── ml/           Dataset preparation & preprocessing
├── docs/         Project documentation
└── README.md
```

## Milestone 1 Deliverables

- [x] Frontend initialization (React + Vite + Tailwind)
- [x] Backend initialization (FastAPI + PostgreSQL)
- [x] Database schema design (Users, LearnerProfiles, Roles)
- [x] Authentication & RBAC (JWT, Bcrypt)
- [x] Learner Profile Management
- [x] ML Dataset Preparation (ASL Alphabet, Sign Language MNIST, WLASL, RWTH-PHOENIX)
- [x] System Architecture Documentation
- [x] API Documentation
- [x] UI Wireframes

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### ML
```bash
cd ml
pip install -r requirements.txt
```

## License

MIT
