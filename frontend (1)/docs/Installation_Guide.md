# Installation Guide

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Git

## 1. Clone Repository

```bash
git clone <repository-url>
cd project-root
```

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

## 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
alembic upgrade head
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`

## 4. Database Setup

```bash
createdb signspeak
cd backend
alembic upgrade head
```

## 5. ML Setup

```bash
cd ml
pip install -r requirements.txt
python preprocessing/preprocess_all.py
```

## Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/signspeak
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
