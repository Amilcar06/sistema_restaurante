"""
Configuration settings for GastroSmart AI Backend
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/gastrosmart"
    MONGODB_URL: str = "mongodb://localhost:27017/gastrosmart"
    DATABASE_TYPE: str = "postgresql"  # postgresql or mongodb
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Configuration
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-3.5-turbo"
    AI_TEMPERATURE: float = 0.7

    # Email Configuration
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "info@gastrosmart.ai"
    EMAILS_FROM_NAME: str = "GastroSmart AI"
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    
    # CORS - Accepts comma-separated string from .env or list
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Business Hours (24-hour format)
    BUSINESS_OPEN_HOUR: int = 8  # 8:00 AM
    BUSINESS_CLOSE_HOUR: int = 22  # 10:00 PM
    BUSINESS_DAYS: List[int] = [0, 1, 2, 3, 4, 5, 6]  # 0=Monday, 6=Sunday (all days)
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

