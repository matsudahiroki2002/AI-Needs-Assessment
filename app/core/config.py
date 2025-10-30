"""
Application configuration settings powered by pydantic-settings.

Keep configuration minimal and environment driven so the backend can be
deployed alongside the Next.js frontend without code changes.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AI Wrapper API"
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    model_chat: str = "gpt-4o-mini"
    openai_api_key: str | None = None
    reaction_cache_size: int = 50
    request_rate_limit_per_minute: int = 60
    backend_url: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
