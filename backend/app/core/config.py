from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "ai-chatbot-api"
    app_env: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(
        default="sqlite+aiosqlite:///./dev.db",
        description="Async SQLAlchemy database URL",
    )
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    chroma_collection: str = "enterprise_kb"

    jwt_secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    db_auto_create_tables: bool = False
    allow_registration: bool = False
    allow_admin_registration: bool = False
    bootstrap_admin_email: str | None = None
    bootstrap_admin_password: str | None = None

    seed_dev_test_users: bool = True
    dev_test_user_email: str = "user@test.company.com"
    dev_test_user_password: str = "TestUser123!"
    dev_test_admin_email: str = "admin@test.company.com"
    dev_test_admin_password: str = "TestAdmin123!"

    aws_region: str = "ap-northeast-2"
    # Bedrock: use IAM roles in Rancher/K8s; never commit credentials.
    bedrock_model_id: str = "anthropic.claude-sonnet-4-20250514-v1:0"

    # NoDecode: .env uses comma-separated URLs, not JSON arrays
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def chroma_url(self) -> str:
        return f"http://{self.chroma_host}:{self.chroma_port}"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
