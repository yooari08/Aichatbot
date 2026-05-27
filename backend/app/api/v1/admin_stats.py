"""Admin — 분석 통계 엔드포인트."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DbSession, require_roles
from app.models.user import User, UserRole
from app.schemas.admin_stats import StatsResponse
from app.services.admin_stats_service import AdminStatsService

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=StatsResponse)
async def get_stats(
    _: AdminUser,
    session: DbSession,
) -> StatsResponse:
    return await AdminStatsService(session).get_stats()
