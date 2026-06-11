from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.schemas.admin_categories import CategorySummary


class AdminCategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_categories(self) -> list[CategorySummary]:
        stmt = (
            select(Document.category, func.count(Document.id).label("cnt"))
            .where(Document.category.is_not(None))
            .group_by(Document.category)
            .order_by(Document.category)
        )
        result = await self._session.execute(stmt)
        return [CategorySummary(name=row.category, document_count=row.cnt) for row in result.all()]

    async def rename_category(self, name: str, new_name: str) -> None:
        new_name = new_name.strip()
        if new_name == name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New name is the same as the current name",
            )
        await self._session.execute(
            update(Document).where(Document.category == name).values(category=new_name)
        )

    async def delete_category(self, name: str, reassign_to: str | None) -> None:
        await self._session.execute(
            update(Document).where(Document.category == name).values(category=reassign_to)
        )

    async def create_category(self, name: str) -> CategorySummary:
        stmt = select(func.count(Document.id)).where(Document.category == name)
        result = await self._session.execute(stmt)
        if result.scalar_one() > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category already exists",
            )
        return CategorySummary(name=name, document_count=0)
