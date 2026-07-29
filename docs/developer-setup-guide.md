# SignLearn Developer Setup Guide

## 1. Local Development Prerequisites
- Node.js >= 20.x
- Python >= 3.11
- Docker Desktop

## 2. Setting Up Backend
```bash
cd backend
python -m venv venv
# Activate virtualenv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 3. Setting Up Frontend
```bash
cd frontend
npm install
npm run dev
```

## 4. Code Quality & Pre-commit
```bash
# Install pre-commit hooks
pre-commit install
```
