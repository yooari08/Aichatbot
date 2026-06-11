from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class FaqCreate(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1, max_length=2000)
    category: str | None = Field(default=None, max_length=64)
    display_order: int = Field(default=0, ge=0)
    is_active: bool = True


class FaqUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=1, max_length=500)
    answer: str | None = Field(default=None, min_length=1, max_length=2000)
    category: str | None = None
    display_order: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class FaqResponse(BaseModel):
    id: UUID
    question: str
    answer: str
    category: str | None
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
