# SignLearn Deployment Guide

## Production Deployment via Docker Compose

### Step 1: Environment Configuration
Copy `.env.example` to `.env` and configure production secrets:
```bash
cp .env.example .env
```

### Step 2: Build & Launch Services
```bash
docker-compose -f docker-compose.yml up -d --build
```

### Step 3: Run Database Migrations
```bash
docker-compose exec backend alembic upgrade head
```

### Step 4: Verify Nginx Routing
Check that HTTP requests to port 80 properly route `/api/*` to FastAPI backend and `/` to Next.js frontend.
