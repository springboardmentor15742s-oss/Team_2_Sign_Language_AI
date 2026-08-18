import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.error_handlers import register_error_handlers
from app.routers import auth, users, courses, lessons, assessments, reports, notifications, practice, admin

logging.basicConfig(level=logging.INFO)
settings.validate_security()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Sign Language Learning & Assessment Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ---------- Global error handlers ----------
register_error_handlers(app)

# ---------- Routers ----------
API_PREFIX = settings.API_V1_PREFIX

ROUTERS = [
    auth.router,
    users.router,
    courses.router,
    lessons.router,
    assessments.router,
    reports.router,
    notifications.router,
    practice.router,
    admin.router,
]

# Canonical versioned API.
for router in ROUTERS:
    app.include_router(router, prefix=API_PREFIX)

# Backward-compatible /api alias because the supplied React client defaults to
# VITE_API_BASE_URL=http://localhost:8000/api. Both paths use the exact same
# RBAC dependencies; the alias does not weaken authorization.
for router in ROUTERS:
    app.include_router(router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": settings.PROJECT_NAME}


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
