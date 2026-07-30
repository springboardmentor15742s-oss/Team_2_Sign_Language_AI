# System Architecture

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  FastAPI Backend │────▶│   PostgreSQL    │
│   (Vite + Tailwind)│    │   (Python)       │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  JWT Auth + RBAC │
         │              └─────────────────┘
         ▼
┌─────────────────┐
│  ML Pipeline    │
│  (Future)       │
└─────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL |
| Auth | JWT, Passlib/Bcrypt |
| ML | Python, OpenCV, NumPy, Pandas, Scikit-learn |

## Folder Structure

```
project-root/
├── frontend/          React application
├── backend/           FastAPI application
│   ├── app/
│   │   ├── api/       API route definitions
│   │   ├── core/      Config, security utilities
│   │   ├── models/    SQLAlchemy ORM models
│   │   ├── schemas/   Pydantic request/response models
│   │   ├── services/  Business logic
│   │   ├── routes/    FastAPI routers
│   │   ├── database/  DB connection & session
│   │   └── middleware/Auth & RBAC middleware
│   └── alembic/       Database migrations
├── ml/                Machine learning
│   ├── datasets/      Raw & processed datasets
│   ├── preprocessing/ Data preprocessing scripts
│   ├── notebooks/     Jupyter notebooks
│   └── utils/         Helper functions
└── docs/              Documentation
```

## API Architecture

- RESTful API design
- Versioned endpoints (`/api/v1/...`)
- JWT Bearer token authentication
- Role-based endpoint protection
- Pydantic request/response validation
