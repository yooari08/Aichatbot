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
        limit: int,
    ) -> AdminConversationListResponse:
        query = (
            select(Conversation, User.email)
            .join(User, User.id == Conversation.user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        rows = (await self._session.execute(query)).all()

        items: list[AdminConversationRow] = []
        for conv, email in rows:
            if q:
                q_lower = q.lower()
                if q_lower not in conv.title.lower() and q_lower not in email.lower():
                    continue

            count_result = await self._session.execute(
                select(func.count()).select_from(Message).where(Message.conversation_id == conv.id)
            )
            message_count = int(count_result.scalar_one())

            last_result = await self._session.execute(
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(Message.created_at.desc())
                .limit(1)
            )
            last = last_result.scalar_one_or_none()
            items.append(
                AdminConversationRow(
                    id=conv.id,
                    user_email=email,
                    title=conv.title,
                    category=conv.category,
                    message_count=message_count,
                    last_message=(last.content[:120] if last else None),
                    last_message_role=(last.role.value if last else None),
                    updated_at=conv.updated_at,
                )
            )
        return AdminConversationListResponse(items=items, total=len(items))
