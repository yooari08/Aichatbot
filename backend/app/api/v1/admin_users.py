"""Admin — 사용자 관리 엔드포인트."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DbSession, require_roles
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.admin_users import AdminUserListResponse, AdminUserResponse

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=AdminUserListResponse)
async def list_users(
    _: AdminUser,
    session: DbSession,
    q: str | None = Query(default=None, description="이메일 검색"),
) -> AdminUserListResponse:
    repo = UserRepository(session)
    rows = await repo.list_with_message_counts()

    # 검색 필터 (이메일)
    if q:
        q_lower = q.lower()
        rows = [(u, cnt) for u, cnt in rows if q_lower in u.email.lower()]

    items = [
        AdminUserResponse(
            id=u.id,
            email=u.email,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
            message_count=cnt,
        )
        for u, cnt in rows
    ]
    return AdminUserListResponse(items=items, total=len(items))
