from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    source: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    id: UUID
    title: str
    category: str | None = None
    pinned: bool
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class ConversationDetail(ConversationSummary):
    messages: list[MessageResponse] = Field(default_factory=list)


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    pinned: bool | None = None


class ChatMessageRequest(BaseModel):
    conversation_id: UUID | None = None
    content: str = Field(min_length=1, max_length=8000)


class ChatStreamEvent(BaseModel):
    type: str
    conversation_id: UUID | None = None
    message_id: UUID | None = None
    text: str | None = None
    source: str | None = None
    title: str | None = None
    category: str | None = None
