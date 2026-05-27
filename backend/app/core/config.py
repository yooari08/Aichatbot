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
    run_migrations_on_startup: bool = True
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
    # Local/dev only — in production use IAM role (do not commit real keys).
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_session_token: str | None = None
    bedrock_model_id: str = "anthropic.claude-sonnet-4-6"
    bedrock_max_tokens: int = 4096
    bedrock_temperature: float = 0.3
    bedrock_mock_enabled: bool = True

    conversation_retention_days: int = 90
    documents_storage_path: str = "./data/documents"

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

    @field_validator("aws_access_key_id", "aws_secret_access_key", "aws_session_token", mode="before")
    @classmethod
    def strip_aws_credential(cls, value: str | None) -> str | None:
        if value is None or not isinstance(value, str):
            return value
        cleaned = value.strip().strip('"').strip("'")
        return cleaned or None

    @property
    def chroma_url(self) -> str:
        return f"http://{self.chroma_host}:{self.chroma_port}"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
