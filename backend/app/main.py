from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.redis import init_redis_pool, close_redis_pool
from app.api.v1.router import api_v1_router
from app.exceptions.handlers import register_exception_handlers
from app.middleware.logging_middleware import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle context manager for database connection pools."""
    logger.info("Initializing SignLearn platform backend services...")
    await connect_to_mongo()
    await init_redis_pool()
    yield
    logger.info("Shutting down SignLearn backend connection pools...")
    await close_mongo_connection()
    await close_redis_pool()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Sign Language Learning & Assessment Platform - Clean Monorepo Architecture (Phase 1)",
    version="1.0.0-phase1",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Custom Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# 3. Global Exception Handlers
register_exception_handlers(app)

# 4. Include API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root_welcome():
    return {
        "message": "Welcome to SignLearn AI Platform API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "phase": "Phase 1 - Scalable Monorepo Architecture"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
