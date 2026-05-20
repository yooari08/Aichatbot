import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.chat import (
    ConversationDetail,
    ConversationSummary,
    ConversationUpdate,
    MessageResponse,
)


class ConversationService:
    def __init__(self, session: AsyncSession) -> None:
        self._conversations = ConversationRepository(session)
        self._messages = MessageRepository(session)

    async def list_summaries(self, user: User) -> list[ConversationSummary]:
        rows = await self._conversations.list_for_user(user.id)
        summaries: list[ConversationSummary] = []
        for row in rows:
            count = await self._conversations.count_messages(row.id)
            summaries.append(
                ConversationSummary(
                    id=row.id,
                    title=row.title,
                    category=row.category,
                    pinned=row.pinned,
                    updated_at=row.updated_at,
                    message_count=count,
                )
            )
        return summaries

    async def get_detail(self, user: User, conversation_id: uuid.UUID) -> ConversationDetail:
        conversation = await self._conversations.get_by_id_for_user(conversation_id, user.id)
        if conversation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        messages = [
            MessageResponse.model_validate(m)
            for m in sorted(conversation.messages, key=lambda m: m.created_at)
        ]
        return ConversationDetail(
            id=conversation.id,
            title=conversation.title,
            category=conversation.category,
            pinned=conversation.pinned,
            updated_at=conversation.updated_at,
            message_count=len(messages),
            messages=messages,
        )

    async def update(
        self, user: User, conversation_id: uuid.UUID, payload: ConversationUpdate
    ) -> ConversationSummary:
        conversation = await self._conversations.get_by_id_for_user(conversation_id, user.id)
        if conversation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        updated = await self._conversations.update(
            conversation,
            title=payload.title,
            pinned=payload.pinned,
        )
        count = await self._conversations.count_messages(updated.id)
        return ConversationSummary(
            id=updated.id,
            title=updated.title,
            category=updated.category,
            pinned=updated.pinned,
            updated_at=updated.updated_at,
            message_count=count,
        )

    async def delete(self, user: User, conversation_id: uuid.UUID) -> None:
        conversation = await self._conversations.get_by_id_for_user(conversation_id, user.id)
        if conversation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        await self._conversations.delete(conversation)
