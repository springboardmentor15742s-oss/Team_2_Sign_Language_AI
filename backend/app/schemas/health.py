from datetime import datetime
from pydantic import BaseModel, Field


class DatabaseStatus(BaseModel):
    postgres: bool = Field(..., description="PostgreSQL database connection status")
    mongodb: bool = Field(..., description="MongoDB connection status")
    redis: bool = Field(..., description="Redis connection status")


class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="healthy")
    app_name: str = Field(..., example="SignLearn AI Platform")
    version: str = Field(..., example="1.0.0-phase1")
    environment: str = Field(..., example="development")
    timestamp: datetime
    services: DatabaseStatus
