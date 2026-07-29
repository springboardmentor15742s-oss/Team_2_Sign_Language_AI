from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import logger


class MongoDBManager:
    client: AsyncIOMotorClient = None
    db = None


mongo_manager = MongoDBManager()


async def connect_to_mongo():
    """Establish async MongoDB connection."""
    try:
        mongo_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
        mongo_manager.db = mongo_manager.client.get_default_database()
        logger.info("Connected to MongoDB successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")


async def close_mongo_connection():
    """Close async MongoDB connection."""
    if mongo_manager.client:
        mongo_manager.client.close()
        logger.info("MongoDB connection closed.")


def get_mongo_db():
    """Dependency provider for MongoDB database reference."""
    return mongo_manager.db
