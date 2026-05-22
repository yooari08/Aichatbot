import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.index_job import IndexJob, IndexJobStatus


class IndexJobRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_jobs(
        self,
        *,
        document_id: uuid.UUID | None = None,
        status: IndexJobStatus | None = None,
        limit: int = 50,
    ) -> list[IndexJob]:
        stmt = select(IndexJob)
        if document_id:
            stmt = stmt.where(IndexJob.document_id == document_id)
        if status:
            stmt = stmt.where(IndexJob.status == status)
        stmt = stmt.order_by(IndexJob.created_at.desc()).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        *,
        document_id: uuid.UUID,
        status: IndexJobStatus = IndexJobStatus.PENDING,
        message: str | None = None,
    ) -> IndexJob:
        job = IndexJob(document_id=document_id, status=status, message=message)
        self._session.add(job)
        await self._session.flush()
        await self._session.refresh(job)
        return job
