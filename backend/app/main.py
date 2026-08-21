import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.error_handlers import register_error_handlers
from app.routers import auth, users, courses, lessons, assessments, reports, notifications, practice, admin
from app.routers import assessment_router, evaluation_router, feedback_router, dashboard_router, platform_router

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
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):[0-9]+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    assessment_router.router,
    evaluation_router.router,
    feedback_router.router,
    dashboard_router.router,
    platform_router.router,
]

# Canonical versioned API.
for router in ROUTERS:
    app.include_router(router, prefix=API_PREFIX)

# Backward-compatible /api alias because the supplied React client defaults to
# VITE_API_BASE_URL=http://localhost:8000/api. Both paths use the exact same
# RBAC dependencies; the alias does not weaken authorization.
for router in ROUTERS:
    app.include_router(router, prefix="/api")


@app.on_event("startup")
def on_startup():
    from app.database.init_db import init_db
    init_db()


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": settings.PROJECT_NAME}


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
