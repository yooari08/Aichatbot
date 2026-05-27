import asyncio
import uuid
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.document import DocumentStatus
from app.models.index_job import IndexJobStatus
from app.repositories.document_repository import DocumentRepository
from app.repositories.index_job_repository import IndexJobRepository
from app.schemas.admin_documents import (
    DocumentCreateRequest,
    DocumentResponse,
    IndexJobResponse,
)
from app.services.indexing_service import IndexingService


class AdminDocumentService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._documents = DocumentRepository(session)
        self._index_jobs = IndexJobRepository(session)
        self._settings = settings
        self._indexing = IndexingService(settings)

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
        job = await self._index_jobs.create(
            document_id=row.id,
            status=IndexJobStatus.RUNNING,
            message="Initial indexing started",
        )
        if payload.content is None:
            await self._documents.update_status(
                row,
                status=DocumentStatus.FAILED,
                error_message="Document content is required for indexing",
            )
            await self._index_jobs.update(
                job,
                status=IndexJobStatus.FAILED,
                message="Indexing failed: missing content",
            )
            return DocumentResponse.model_validate(row)

        await self._index_document_content(
            document_id=row.id,
            content=payload.content,
            document=row,
            job=job,
        )
        return DocumentResponse.model_validate(row)

    async def upload_document(
        self,
        *,
        file_name: str,
        content: bytes,
        category: str | None,
        owner_name: str | None,
    ) -> DocumentResponse:
        documents_dir = Path(self._settings.documents_storage_path)
        await asyncio.to_thread(documents_dir.mkdir, parents=True, exist_ok=True)
        safe_name = Path(file_name).name
        storage_name = f"{uuid.uuid4()}_{safe_name}"
        storage_path = documents_dir / storage_name
        await asyncio.to_thread(storage_path.write_bytes, content)

        row = await self._documents.create(
            file_name=safe_name,
            storage_path=str(storage_path),
            category=category,
            owner_name=owner_name,
            status=DocumentStatus.PROCESSING,
        )
        job = await self._index_jobs.create(
            document_id=row.id,
            status=IndexJobStatus.RUNNING,
            message="Initial indexing started",
        )

        await self._index_document_content(
            document_id=row.id,
            content=self._decode_content(content),
            document=row,
            job=job,
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
            status=IndexJobStatus.RUNNING,
            message=message or "Reindex requested by admin",
        )
        try:
            content = await asyncio.to_thread(Path(row.storage_path).read_bytes)
            await self._index_document_content(
                document_id=row.id,
                content=self._decode_content(content),
                document=row,
                job=job,
            )
        except Exception as exc:
            await self._documents.update_status(
                row,
                status=DocumentStatus.FAILED,
                error_message=str(exc),
            )
            await self._index_jobs.update(
                job,
                status=IndexJobStatus.FAILED,
                message=f"Reindex failed: {exc}",
            )
        return IndexJobResponse.model_validate(job)

    async def delete_document(self, document_id: uuid.UUID) -> None:
        row = await self._documents.get_by_id(document_id)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        try:
            await self._indexing.delete_document(str(row.id))
        except Exception:
            pass
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

    @staticmethod
    def _decode_content(content: bytes) -> str:
        decoded = content.decode("utf-8", errors="ignore").strip()
        if not decoded:
            raise ValueError("Text extraction failed from uploaded document")
        return decoded

    async def _index_document_content(
        self,
        *,
        document_id: uuid.UUID,
        content: str,
        document,
        job,
    ) -> None:
        try:
            chunks = await self._indexing.index_document(str(document_id), content)
            await self._documents.update_status(document, status=DocumentStatus.DONE, error_message=None)
            await self._index_jobs.update(
                job,
                status=IndexJobStatus.SUCCEEDED,
                message=f"Indexed {chunks} chunks",
            )
        except Exception as exc:
            await self._documents.update_status(
                document,
                status=DocumentStatus.FAILED,
                error_message=str(exc),
            )
            await self._index_jobs.update(
                job,
                status=IndexJobStatus.FAILED,
                message=f"Indexing failed: {exc}",
            )
