import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.faq import Faq
from app.schemas.faq import FaqCreate, FaqResponse, FaqUpdate


class FaqService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_faqs(
        self,
        *,
        category: str | None,
        is_active: bool | None,
    ) -> list[FaqResponse]:
        stmt = select(Faq)
        if category is not None:
            stmt = stmt.where(Faq.category == category)
        if is_active is not None:
            stmt = stmt.where(Faq.is_active == is_active)
        stmt = stmt.order_by(Faq.display_order.asc(), Faq.created_at.asc())
        result = await self._session.execute(stmt)
        return [FaqResponse.model_validate(row) for row in result.scalars().all()]

    async def create_faq(self, payload: FaqCreate) -> FaqResponse:
        faq = Faq(
            question=payload.question,
            answer=payload.answer,
            category=payload.category,
            display_order=payload.display_order,
            is_active=payload.is_active,
        )
        self._session.add(faq)
        await self._session.flush()
        await self._session.refresh(faq)
        return FaqResponse.model_validate(faq)

    async def update_faq(self, faq_id: uuid.UUID, payload: FaqUpdate) -> FaqResponse:
        faq = await self._get_or_404(faq_id)
        if payload.question is not None:
            faq.question = payload.question
        if payload.answer is not None:
            faq.answer = payload.answer
        if payload.category is not None:
            faq.category = payload.category
        if payload.display_order is not None:
            faq.display_order = payload.display_order
        if payload.is_active is not None:
            faq.is_active = payload.is_active
        await self._session.flush()
        await self._session.refresh(faq)
        return FaqResponse.model_validate(faq)

    async def delete_faq(self, faq_id: uuid.UUID) -> None:
        faq = await self._get_or_404(faq_id)
        await self._session.delete(faq)

    async def toggle_faq(self, faq_id: uuid.UUID) -> FaqResponse:
        faq = await self._get_or_404(faq_id)
        faq.is_active = not faq.is_active
        await self._session.flush()
        await self._session.refresh(faq)
        return FaqResponse.model_validate(faq)

    async def _get_or_404(self, faq_id: uuid.UUID) -> Faq:
        result = await self._session.execute(select(Faq).where(Faq.id == faq_id))
        faq = result.scalar_one_or_none()
        if faq is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
        return faq
