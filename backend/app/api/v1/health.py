from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.postgres import get_db
from app.database.mongodb import get_mongo_db
from app.database.redis import get_redis_client
from app.schemas.health import HealthCheckResponse, DatabaseStatus
from app.schemas.base import StandardResponse
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/health", tags=["Health & System Status"])


@router.get(
    "",
    response_model=StandardResponse[HealthCheckResponse],
    summary="SignLearn Platform Health Check",
    description="Verifies status of FastAPI application and connection state of PostgreSQL, MongoDB, and Redis."
)
async def check_health(
    db: AsyncSession = Depends(get_db),
    mongo_db=Depends(get_mongo_db),
    redis_client=Depends(get_redis_client)
):
    # 1. Test PostgreSQL
    postgres_healthy = False
    try:
        result = await db.execute(text("SELECT 1"))
        postgres_healthy = result.scalar() == 1
    except Exception as e:
        logger.error(f"Health check PostgreSQL error: {e}")

    # 2. Test MongoDB
    mongodb_healthy = False
    try:
        if mongo_db is not None:
            await mongo_db.command("ping")
            mongodb_healthy = True
    except Exception as e:
        logger.error(f"Health check MongoDB error: {e}")

    # 3. Test Redis
    redis_healthy = False
    try:
        if redis_client is not None:
            redis_healthy = await redis_client.ping()
    except Exception as e:
        logger.error(f"Health check Redis error: {e}")

    system_status = "healthy" if (postgres_healthy and mongodb_healthy and redis_healthy) else "degraded"

    health_payload = HealthCheckResponse(
        status=system_status,
        app_name=settings.APP_NAME,
        version="1.0.0-phase1",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        services=DatabaseStatus(
            postgres=postgres_healthy,
            mongodb=mongodb_healthy,
            redis=redis_healthy
        )
    )

    return StandardResponse(
        success=True,
        message=f"SignLearn system health status: {system_status.upper()}",
        data=health_payload
    )
