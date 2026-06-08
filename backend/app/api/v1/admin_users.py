"""Admin — 사용자 관리 엔드포인트."""
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import DbSession, require_roles
from app.core.security import hash_password
from app.models.audit_log import AuditAction
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.admin_users import AdminUserListResponse, AdminUserResponse
from app.services.audit_service import log_action

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


def _to_response(user: User, message_count: int = 0) -> AdminUserResponse:
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        message_count=message_count,
    )


class InviteUserPayload(BaseModel):
    email: str
    password: str
    role: UserRole = UserRole.USER


class RolePatch(BaseModel):
    role: UserRole


class ActivePatch(BaseModel):
    is_active: bool


@router.post("", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def invite_user(
    payload: InviteUserPayload,
    requester: AdminUser,
    session: DbSession,
) -> AdminUserResponse:
    repo = UserRepository(session)
    if await repo.get_by_email(payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = await repo.create(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    await log_action(
        session,
        action=AuditAction.CREATE,
        user_id=requester.id,
        user_email=requester.email,
        resource_type="user",
        resource_id=str(user.id),
        detail=f"invited {user.email} as {user.role.value}",
    )
    return _to_response(user)


@router.get("", response_model=AdminUserListResponse)
async def list_users(
    _: AdminUser,
    session: DbSession,
    q: str | None = Query(default=None, description="이메일 검색"),
) -> AdminUserListResponse:
    repo = UserRepository(session)
    rows = await repo.list_with_message_counts()

    if q:
        q_lower = q.lower()
        rows = [(u, cnt) for u, cnt in rows if q_lower in u.email.lower()]

    items = [_to_response(u, cnt) for u, cnt in rows]
    return AdminUserListResponse(items=items, total=len(items))


@router.patch("/{user_id}/role", response_model=AdminUserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    payload: RolePatch,
    requester: AdminUser,
    session: DbSession,
) -> AdminUserResponse:
    user = await UserRepository(session).get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = payload.role
    await log_action(
        session,
        action=AuditAction.UPDATE,
        user_id=requester.id,
        user_email=requester.email,
        resource_type="user",
        resource_id=str(user_id),
        detail=f"role → {payload.role.value}",
    )
    return _to_response(user)


@router.patch("/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: ActivePatch,
    requester: AdminUser,
    session: DbSession,
) -> AdminUserResponse:
    user = await UserRepository(session).get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = payload.is_active
    await log_action(
        session,
        action=AuditAction.UPDATE,
        user_id=requester.id,
        user_email=requester.email,
        resource_type="user",
        resource_id=str(user_id),
        detail=f"is_active → {payload.is_active}",
    )
    return _to_response(user)
