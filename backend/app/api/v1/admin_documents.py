import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, require_roles
from app.models.document import DocumentStatus
from app.models.index_job import IndexJobStatus
from app.models.user import User, UserRole
from app.schemas.admin_documents import (
    DocumentCreateRequest,
    DocumentResponse,
    IndexJobResponse,
    ReindexRequest,
)
from app.services.admin_document_service import AdminDocumentService

router = APIRouter(prefix="/admin/documents", tags=["admin-documents"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    _: AdminUser,
    session: DbSession,
    category: str | None = None,
    status_filter: DocumentStatus | None = Query(default=None, alias="status"),
    query: str | None = Query(default=None, alias="q"),
) -> list[DocumentResponse]:
    return await AdminDocumentService(session).list_documents(
        category=category,
        status_filter=status_filter,
        query=query,
    )


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreateRequest,
    _: AdminUser,
    session: DbSession,
) -> DocumentResponse:
    return await AdminDocumentService(session).create_document(payload)


@router.get("/index-jobs", response_model=list[IndexJobResponse])
async def list_index_jobs(
    _: AdminUser,
    session: DbSession,
    document_id: uuid.UUID | None = None,
    status_filter: IndexJobStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[IndexJobResponse]:
    return await AdminDocumentService(session).list_index_jobs(
        document_id=document_id,
        status_filter=status_filter,
        limit=limit,
    )


@router.post("/{document_id}/reindex", response_model=IndexJobResponse)
async def reindex_document(
    document_id: uuid.UUID,
    payload: ReindexRequest,
    _: AdminUser,
    session: DbSession,
) -> IndexJobResponse:
    return await AdminDocumentService(session).reindex_document(
        document_id,
        payload.message,
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    _: AdminUser,
    session: DbSession,
) -> None:
    await AdminDocumentService(session).delete_document(document_id)
