"""Admin — 감사 로그 엔드포인트."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select

from app.api.deps import DbSession, require_roles
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from app.schemas.audit_log import AuditLogEntry, AuditLogListResponse

router = APIRouter(prefix="/admin/audit-log", tags=["admin-audit-log"])

AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=AuditLogListResponse)
async def list_audit_log(
    _: AdminUser,
    session: DbSession,
    q: str | None = Query(default=None, description="이메일 검색"),
    action: str | None = Query(
        default=None,
        description="액션 필터 (CREATE/UPDATE/DELETE/LOGIN/LOGIN_FAILED)",
    ),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
) -> AuditLogListResponse:
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc())
    count_stmt = select(func.count()).select_from(AuditLog)

    if q:
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(AuditLog.user_email.ilike(pattern))
        count_stmt = count_stmt.where(AuditLog.user_email.ilike(pattern))
    if action:
        stmt = stmt.where(AuditLog.action == action.upper())
        count_stmt = count_stmt.where(AuditLog.action == action.upper())

    total = (await session.execute(count_stmt)).scalar_one()
    rows = (await session.execute(stmt.offset(offset).limit(limit))).scalars().all()

    return AuditLogListResponse(
        items=[AuditLogEntry.model_validate(r) for r in rows],
        total=total,
    )
