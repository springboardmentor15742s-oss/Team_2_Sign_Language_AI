import os
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "SignLearn AI Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = Field(default="signlearn_default_secret_key_change_in_prod")
    JWT_SECRET: str = Field(default="signlearn_jwt_secret_key_change_in_prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database URLs
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://signlearn:signlearn_secret@localhost:5432/signlearn_db"
    )
    MONGODB_URL: str = Field(
        default="mongodb://admin:admin_secret@localhost:27017/signlearn_nosql?authSource=admin"
    )
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
