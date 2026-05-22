import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentStatus


class DocumentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_documents(
        self,
        *,
        category: str | None = None,
        status: DocumentStatus | None = None,
        query: str | None = None,
    ) -> list[Document]:
        stmt = select(Document)
        if category:
            stmt = stmt.where(Document.category == category)
        if status:
            stmt = stmt.where(Document.status == status)
        if query:
            like = f"%{query}%"
            stmt = stmt.where(Document.file_name.ilike(like))

        result = await self._session.execute(stmt.order_by(Document.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, document_id: uuid.UUID) -> Document | None:
        result = await self._session.execute(select(Document).where(Document.id == document_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        file_name: str,
        storage_path: str,
        category: str | None,
        owner_name: str | None,
        status: DocumentStatus = DocumentStatus.PROCESSING,
    ) -> Document:
        document = Document(
            file_name=file_name,
            storage_path=storage_path,
            category=category,
            owner_name=owner_name,
            status=status,
        )
        self._session.add(document)
        await self._session.flush()
        await self._session.refresh(document)
        return document

    async def update_status(
        self,
        document: Document,
        *,
        status: DocumentStatus,
        error_message: str | None = None,
    ) -> Document:
        document.status = status
        document.error_message = error_message
        await self._session.flush()
        await self._session.refresh(document)
        return document

    async def delete(self, document: Document) -> None:
        await self._session.delete(document)
