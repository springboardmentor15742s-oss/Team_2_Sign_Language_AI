import redis.asyncio as aioredis
from app.core.config import settings
from app.core.logging import logger


class RedisManager:
    redis_client: aioredis.Redis = None


redis_manager = RedisManager()


async def init_redis_pool():
    """Initialize Redis async client pool."""
    try:
        redis_manager.redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        await redis_manager.redis_client.ping()
        logger.info("Connected to Redis successfully.")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")


async def close_redis_pool():
    """Close Redis async client pool."""
    if redis_manager.redis_client:
        await redis_manager.redis_client.close()
        logger.info("Redis connection closed.")


def get_redis_client():
    """Dependency provider for Redis client."""
    return redis_manager.redis_client
