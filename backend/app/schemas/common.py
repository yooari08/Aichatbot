from typing import Any

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str
    environment: str


class ReadyResponse(BaseModel):
    status: str
    checks: dict[str, str] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None
    errors: list[dict[str, Any]] | None = None
