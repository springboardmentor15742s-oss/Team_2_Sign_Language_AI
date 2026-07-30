from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration.
    Values are loaded from environment variables / a .env file.
    """

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "sign_language"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""

    # Security
    SECRET_KEY: str = "dev_secret_key_change_me"
    REFRESH_SECRET_KEY: str = "dev_refresh_secret_key_change_me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # App
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "SignSpeak API"
    API_V1_PREFIX: str = "/api/v1"

    @property
    def DATABASE_URL(self) -> str:
        return (
    f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}"
    f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
)

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()