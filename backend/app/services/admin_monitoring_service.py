from datetime import date, datetime, time, timezone, timedelta
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.db.health import check_database
from app.db.session import get_engine
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.admin_monitoring import (
    AdminConversationListResponse,
    AdminConversationRow,
    AdminHealthResponse,
)
from app.services.indexing_service import IndexingService


class AdminMonitoringService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings

    async def get_health(self) -> AdminHealthResponse:
        postgres_ok = False
        try:
            postgres_ok = await check_database(get_engine())
        except RuntimeError:
            postgres_ok = False

        # Chroma health: lightweight retrieval probe.
        chroma_ok = False
        try:
            await IndexingService(self._settings).search("health-check", n_results=1)
            chroma_ok = True
        except Exception:
            chroma_ok = False

        checks = {
            "api": "ok",
            "postgres": "ok" if postgres_ok else "unavailable",
            "chroma": "ok" if chroma_ok else "unavailable",
            "bedrock": "mock" if self._settings.bedrock_mock_enabled else "configured",
        }
        status = "ready" if postgres_ok and chroma_ok else "degraded"
        return AdminHealthResponse(
            status=status,
            checks=checks,
            bedrock_mock_enabled=self._settings.bedrock_mock_enabled,
        )

    async def list_recent_conversations(
        self,
        *,
        q: str | None,
        date_from: date | None,
        date_to: date | None,
        limit: int,
    ) -> AdminConversationListResponse:
        query = (
            select(Conversation, User.email)
            .join(User, User.id == Conversation.user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )

        KST = timezone(timedelta(hours=9))
        if date_from:
            # Convert KST midnight → naive UTC so SQLite stores-as-UTC compares correctly
            dt = datetime.combine(date_from, time.min, tzinfo=KST).astimezone(timezone.utc).replace(tzinfo=None)
            query = query.where(Conversation.updated_at >= dt)
        if date_to:
            dt = datetime.combine(date_to, time.max, tzinfo=KST).astimezone(timezone.utc).replace(tzinfo=None)
            query = query.where(Conversation.updated_at <= dt)

        rows = (await self._session.execute(query)).all()
        if not rows:
            return AdminConversationListResponse(items=[], total=0)

        conv_ids: list[UUID] = [conv.id for conv, _ in rows]

        # Bulk message count — 1 query for all conversations
        count_rows = (await self._session.execute(
            select(Message.conversation_id, func.count().label("cnt"))
            .where(Message.conversation_id.in_(conv_ids))
            .group_by(Message.conversation_id)
        )).all()
        counts: dict[UUID, int] = {r.conversation_id: r.cnt for r in count_rows}

        # Bulk last message — 1 query using ROW_NUMBER window function
        rn = func.row_number().over(
            partition_by=Message.conversation_id,
            order_by=Message.created_at.desc(),
        ).label("rn")
        ranked_subq = (
            select(
                Message.conversation_id,
                Message.content,
                Message.role,
                rn,
            )
            .where(Message.conversation_id.in_(conv_ids))
            .subquery()
        )
        last_rows = (await self._session.execute(
            select(ranked_subq).where(ranked_subq.c.rn == 1)
        )).all()
        lasts: dict[UUID, tuple[str, str]] = {
            r.conversation_id: (r.content, r.role) for r in last_rows
        }

        items: list[AdminConversationRow] = []
        for conv, email in rows:
            last_pair = lasts.get(conv.id)
            items.append(
                AdminConversationRow(
                    id=conv.id,
                    user_email=email,
                    title=conv.title,
                    category=conv.category,
                    message_count=counts.get(conv.id, 0),
                    last_message=(last_pair[0][:120] if last_pair else None),
                    last_message_role=(last_pair[1] if last_pair else None),
                    updated_at=conv.updated_at,
                )
            )
        return AdminConversationListResponse(items=items, total=len(items))
