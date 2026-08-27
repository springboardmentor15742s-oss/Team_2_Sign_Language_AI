from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration.
    Values are loaded from environment variables / a .env file.
    """

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "sign_language_platform"
    DB_USER: str = "dheekshika"
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

    def validate_security(self) -> None:
        if self.ENVIRONMENT.lower() in {"production", "prod"}:
            if len(self.SECRET_KEY) < 32 or self.SECRET_KEY == "dev_secret_key_change_me":
                raise ValueError("A strong SECRET_KEY is required in production")
            if len(self.REFRESH_SECRET_KEY) < 32 or self.REFRESH_SECRET_KEY == "dev_refresh_secret_key_change_me":
                raise ValueError("A strong REFRESH_SECRET_KEY is required in production")

settings = Settings()
