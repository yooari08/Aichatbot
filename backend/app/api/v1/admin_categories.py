from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, require_roles
from app.models.user import User, UserRole
from app.schemas.admin_categories import CategoryCreateRequest, CategoryRenameRequest, CategorySummary
from app.services.admin_category_service import AdminCategoryService

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=list[CategorySummary])
async def list_categories(
    _: AdminUser,
    session: DbSession,
) -> list[CategorySummary]:
    return await AdminCategoryService(session).list_categories()


@router.post("", response_model=CategorySummary, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateRequest,
    _: AdminUser,
    session: DbSession,
) -> CategorySummary:
    return await AdminCategoryService(session).create_category(payload.name)


@router.patch("/{name}/rename", status_code=status.HTTP_204_NO_CONTENT)
async def rename_category(
    name: str,
    payload: CategoryRenameRequest,
    _: AdminUser,
    session: DbSession,
) -> None:
    await AdminCategoryService(session).rename_category(name, payload.new_name)


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    name: str,
    _: AdminUser,
    session: DbSession,
    reassign_to: str | None = Query(default=None),
) -> None:
    await AdminCategoryService(session).delete_category(name, reassign_to)
