import uuid
from datetime import datetime

from pydantic import BaseModel


class AuditLogEntry(BaseModel):
    id: uuid.UUID
    user_email: str | None
    action: str
    resource_type: str | None
    resource_id: str | None
    detail: str | None
    ip_address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    items: list[AuditLogEntry]
    total: int
