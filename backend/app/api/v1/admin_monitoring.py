from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DbSession, SettingsDep, require_roles
from app.models.user import User, UserRole
from app.schemas.admin_monitoring import AdminConversationListResponse, AdminHealthResponse
from app.services.admin_monitoring_service import AdminMonitoringService

router = APIRouter(prefix="/admin", tags=["admin-monitoring"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("/health", response_model=AdminHealthResponse)
async def get_admin_health(
    _: AdminUser,
    session: DbSession,
    settings: SettingsDep,
) -> AdminHealthResponse:
    return await AdminMonitoringService(session, settings).get_health()


@router.get("/monitoring/conversations", response_model=AdminConversationListResponse)
async def list_admin_conversations(
    _: AdminUser,
    session: DbSession,
    settings: SettingsDep,
    q: str | None = Query(default=None, description="대화 제목/이메일 검색"),
    limit: int = Query(default=50, ge=1, le=200),
) -> AdminConversationListResponse:
    return await AdminMonitoringService(session, settings).list_recent_conversations(
        q=q,
        limit=limit,
    )
