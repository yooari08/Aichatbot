from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AdminHealthResponse(BaseModel):
    status: str
    checks: dict[str, str]
    bedrock_mock_enabled: bool


class AdminConversationRow(BaseModel):
    id: UUID
    user_email: str
    title: str
    category: str | None = None
    message_count: int
    last_message: str | None = None
    last_message_role: str | None = None
    updated_at: datetime


class AdminConversationListResponse(BaseModel):
    items: list[AdminConversationRow]
    total: int
