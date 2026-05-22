import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import DocumentStatus
from app.models.index_job import IndexJobStatus
from app.repositories.document_repository import DocumentRepository
from app.repositories.index_job_repository import IndexJobRepository
from app.schemas.admin_documents import (
    DocumentCreateRequest,
    DocumentResponse,
    IndexJobResponse,
)


class AdminDocumentService:
    def __init__(self, session: AsyncSession) -> None:
        self._documents = DocumentRepository(session)
        self._index_jobs = IndexJobRepository(session)

    async def list_documents(
        self,
        *,
        category: str | None,
        status_filter: DocumentStatus | None,
        query: str | None,
    ) -> list[DocumentResponse]:
        rows = await self._documents.list_documents(
            category=category,
            status=status_filter,
            query=query,
        )
        return [DocumentResponse.model_validate(row) for row in rows]

    async def create_document(self, payload: DocumentCreateRequest) -> DocumentResponse:
        row = await self._documents.create(
            file_name=payload.file_name,
            storage_path=payload.storage_path,
            category=payload.category,
            owner_name=payload.owner_name,
            status=DocumentStatus.PROCESSING,
        )
        await self._index_jobs.create(
            document_id=row.id,
            status=IndexJobStatus.PENDING,
            message="Initial indexing queued",
        )
        return DocumentResponse.model_validate(row)

    async def reindex_document(self, document_id: uuid.UUID, message: str | None) -> IndexJobResponse:
        row = await self._documents.get_by_id(document_id)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        await self._documents.update_status(
            row,
            status=DocumentStatus.PROCESSING,
            error_message=None,
        )
        job = await self._index_jobs.create(
            document_id=row.id,
            status=IndexJobStatus.PENDING,
            message=message or "Reindex requested by admin",
        )
        return IndexJobResponse.model_validate(job)

    async def delete_document(self, document_id: uuid.UUID) -> None:
        row = await self._documents.get_by_id(document_id)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        await self._documents.delete(row)

    async def list_index_jobs(
        self,
        *,
        document_id: uuid.UUID | None,
        status_filter: IndexJobStatus | None,
        limit: int,
    ) -> list[IndexJobResponse]:
        jobs = await self._index_jobs.list_jobs(
            document_id=document_id,
            status=status_filter,
            limit=limit,
        )
        return [IndexJobResponse.model_validate(job) for job in jobs]
