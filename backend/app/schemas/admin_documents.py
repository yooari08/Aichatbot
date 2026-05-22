from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.document import DocumentStatus
from app.models.index_job import IndexJobStatus


class DocumentCreateRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    storage_path: str = Field(min_length=1, max_length=1024)
    category: str | None = Field(default=None, max_length=64)
    owner_name: str | None = Field(default=None, max_length=128)


class DocumentResponse(BaseModel):
    id: UUID
    file_name: str
    storage_path: str
    category: str | None = None
    owner_name: str | None = None
    status: DocumentStatus
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReindexRequest(BaseModel):
    message: str | None = Field(
        default="Reindex requested by admin",
        max_length=500,
    )


class IndexJobResponse(BaseModel):
    id: UUID
    document_id: UUID
    status: IndexJobStatus
    message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
