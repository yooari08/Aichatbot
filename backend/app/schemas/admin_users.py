import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.user import UserRole


class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    message_count: int  # 해당 유저의 전체 메시지 수

    model_config = {"from_attributes": True}


class AdminUserListResponse(BaseModel):
    items: list[AdminUserResponse]
    total: int
