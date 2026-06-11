import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, require_roles
from app.models.user import User, UserRole
from app.schemas.faq import FaqCreate, FaqResponse, FaqUpdate
from app.services.faq_service import FaqService

router = APIRouter(prefix="/admin/faq", tags=["admin-faq"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=list[FaqResponse])
async def list_faqs(
    _: AdminUser,
    session: DbSession,
    category: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
) -> list[FaqResponse]:
    return await FaqService(session).list_faqs(category=category, is_active=is_active)


@router.post("", response_model=FaqResponse, status_code=status.HTTP_201_CREATED)
async def create_faq(
    payload: FaqCreate,
    _: AdminUser,
    session: DbSession,
) -> FaqResponse:
    return await FaqService(session).create_faq(payload)


@router.put("/{faq_id}", response_model=FaqResponse)
async def update_faq(
    faq_id: uuid.UUID,
    payload: FaqUpdate,
    _: AdminUser,
    session: DbSession,
) -> FaqResponse:
    return await FaqService(session).update_faq(faq_id, payload)


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faq(
    faq_id: uuid.UUID,
    _: AdminUser,
    session: DbSession,
) -> None:
    await FaqService(session).delete_faq(faq_id)


@router.patch("/{faq_id}/toggle", response_model=FaqResponse)
async def toggle_faq(
    faq_id: uuid.UUID,
    _: AdminUser,
    session: DbSession,
) -> FaqResponse:
    return await FaqService(session).toggle_faq(faq_id)
