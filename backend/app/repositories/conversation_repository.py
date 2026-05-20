import uuid
from datetime import UTC, datetime

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation


class ConversationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id_for_user(
        self, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> Conversation | None:
        result = await self._session.execute(
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
            .options(selectinload(Conversation.messages))
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: uuid.UUID) -> list[Conversation]:
        result = await self._session.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.pinned.desc(), Conversation.updated_at.desc())
        )
        return list(result.scalars().all())

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        title: str,
        category: str | None = None,
    ) -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            title=title,
            category=category,
            pinned=False,
        )
        self._session.add(conversation)
        await self._session.flush()
        await self._session.refresh(conversation)
        return conversation

    async def update(
        self,
        conversation: Conversation,
        *,
        title: str | None = None,
        pinned: bool | None = None,
        category: str | None = None,
    ) -> Conversation:
        if title is not None:
            conversation.title = title
        if pinned is not None:
            conversation.pinned = pinned
        if category is not None:
            conversation.category = category
        await self._session.flush()
        await self._session.refresh(conversation)
        return conversation

    async def delete(self, conversation: Conversation) -> None:
        await self._session.delete(conversation)

    async def touch(self, conversation: Conversation) -> None:
        conversation.updated_at = datetime.now(UTC)
        await self._session.flush()

    async def delete_older_than(self, user_id: uuid.UUID, cutoff: datetime) -> int:
        result = await self._session.execute(
            delete(Conversation).where(
                Conversation.user_id == user_id,
                Conversation.updated_at < cutoff,
            )
        )
        return int(result.rowcount or 0)

    async def delete_all_older_than(self, cutoff: datetime) -> int:
        result = await self._session.execute(
            delete(Conversation).where(Conversation.updated_at < cutoff)
        )
        return int(result.rowcount or 0)

    async def count_messages(self, conversation_id: uuid.UUID) -> int:
        from app.models.message import Message

        result = await self._session.execute(
            select(func.count()).select_from(Message).where(Message.conversation_id == conversation_id)
        )
        return int(result.scalar_one())
