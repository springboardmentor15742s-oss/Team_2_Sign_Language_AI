# SignLearn - AI-Powered Sign Language Learning & Assessment Platform

> **Infosys Internship Project — Phase 1: Production-Ready Baseline Architecture**

SignLearn is a multi-role, AI-driven sign language education platform engineered to provide accessible, real-time gesture feedback, interactive sign language courses, automated assessment grading, and progress analytics for Learners, Instructors, Accessibility Trainers, and Administrators.

---

## 🚀 Phase 1 Scope & Architecture Objectives

Phase 1 focuses exclusively on establishing an enterprise-grade monorepo foundation. **No business logic, authentication execution, AI model runtime, or dashboards have been implemented in this phase.**

### Key Achievements in Phase 1:
- **FastAPI Clean Architecture Backend**: Routers (`/api/v1`), Services, Repositories, Pydantic Settings, Structured Logging, and Global Exception Handlers.
- **Multi-Database Drivers**: Connection managers for **PostgreSQL** (SQLAlchemy 2.0 Async + Alembic), **MongoDB** (Motor), and **Redis** (aioredis).
- **Next.js 15 Frontend System**: App Router with TypeScript, Tailwind CSS, Framer Motion, Zustand state stores, and TanStack React Query.
- **SignLearn Presentation Landing Page**: Modern homepage introducing platform features, tech pillars, and live API status check.
- **Docker Compose Containerization**: Multi-stage Docker builds for backend, frontend, PostgreSQL, MongoDB, Redis, and Nginx reverse proxy.
- **Code Quality Automation**: Pre-commit hooks (`Black`, `isort`, `flake8`, `mypy`), `Husky`, `lint-staged`, `ESLint`, and `Prettier`.
- **CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 Async, Alembic, Pydantic V2, Uvicorn |
| **Databases** | PostgreSQL 16 (Primary RDBMS), MongoDB 7.0 (NoSQL Sign Data), Redis 7.0 (Cache/PubSub) |
| **DevOps** | Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions |

---

## 📁 Repository Structure Overview

```text
SignLearn/
├── backend/            # FastAPI Python Clean Architecture
├── frontend/           # Next.js 15 App Router Frontend & UI Library
├── shared/             # Shared TypeScript enums, interfaces, and types
├── docs/               # 12 Comprehensive Architectural Guides
├── docker/             # Dockerfiles & Nginx proxy configuration
├── .github/            # GitHub Actions CI/CD workflows
├── scripts/            # Helper deployment and setup scripts
└── docker-compose.yml  # Multi-service orchestration
```

---

## 🚦 Quickstart Guide

### Prerequisites
- Node.js >= 20.x
- Python >= 3.11
- Docker & Docker Compose

### 1. Run via Docker Compose (Recommended)
```bash
# Clone and enter directory
cd SignLearn

# Launch all containers (Postgres, MongoDB, Redis, FastAPI, Next.js, Nginx)
docker-compose up --build
```
- **SignLearn Web App**: `http://localhost:3000` (or `http://localhost` via Nginx)
- **FastAPI OpenAPI Swagger**: `http://localhost:8000/docs`
- **API Health Check**: `http://localhost:8000/api/v1/health`

### 2. Manual Local Development

#### Backend:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation Index

Detailed architectural documentation is located in the [`docs/`](./docs) folder:

- [Architecture Overview](./docs/architecture-overview.md)
- [Folder Responsibilities](./docs/folder-responsibilities.md)
- [Database Overview & Schema Design](./docs/database-overview.md)
- [API Versioning Strategy](./docs/api-versioning-strategy.md)
- [Future Module Integration Guide](./docs/future-module-integration.md)
- [Coding Standards](./docs/coding-standards.md)
- [Naming Conventions](./docs/naming-conventions.md)
- [Environment Variables Guide](./docs/environment-variables.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Developer Setup Guide](./docs/developer-setup-guide.md)
- [Folder Structure Tree](./docs/folder-structure.md)
