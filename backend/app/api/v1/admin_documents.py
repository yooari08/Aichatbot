import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status

from app.api.deps import DbSession, SettingsDep, require_roles
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
    settings: SettingsDep,
    category: str | None = None,
    status_filter: DocumentStatus | None = Query(default=None, alias="status"),
    query: str | None = Query(default=None, alias="q"),
) -> list[DocumentResponse]:
    return await AdminDocumentService(session, settings).list_documents(
        category=category,
        status_filter=status_filter,
        query=query,
    )


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreateRequest,
    _: AdminUser,
    session: DbSession,
    settings: SettingsDep,
) -> DocumentResponse:
    return await AdminDocumentService(session, settings).create_document(payload)


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    _: AdminUser,
    session: DbSession,
    settings: SettingsDep,
    file: UploadFile = File(...),
    category: str | None = Form(default=None),
    owner_name: str | None = Form(default=None),
) -> DocumentResponse:
    content = await file.read()
    return await AdminDocumentService(session, settings).upload_document(
        file_name=file.filename or "uploaded.txt",
        content=content,
        category=category,
        owner_name=owner_name,
    )


@router.get("/index-jobs", response_model=list[IndexJobResponse])
async def list_index_jobs(
    _: AdminUser,
    session: DbSession,
    settings: SettingsDep,
    document_id: uuid.UUID | None = None,
    status_filter: IndexJobStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[IndexJobResponse]:
    return await AdminDocumentService(session, settings).list_index_jobs(
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
    settings: SettingsDep,
) -> IndexJobResponse:
    return await AdminDocumentService(session, settings).reindex_document(
        document_id,
        payload.message,
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    _: AdminUser,
    session: DbSession,
    settings: SettingsDep,
) -> None:
    await AdminDocumentService(session, settings).delete_document(document_id)
