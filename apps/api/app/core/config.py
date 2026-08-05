from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    APP_NAME: str = "VeriFin AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://verifin-ai.vercel.app",
    ]

    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "verifin_ai"

    # Security
    JWT_SECRET: str = "change-me-in-production-min-32-chars-long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI Service
    AI_SERVICE_URL: str = "http://localhost:8001"
    AI_SERVICE_API_KEY: str = "verifin-ai-service-key"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # File storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://verifin-ai.vercel.app",
    ]


settings = Settings()
