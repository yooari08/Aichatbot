import json
import uuid
from collections.abc import AsyncIterator

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.message import MessageRole
from app.models.user import User
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.chat import ChatStreamEvent
from app.services.bedrock_service import BedrockService
from app.services.category_detect import detect_category
from app.services.indexing_service import IndexingService


def _truncate_title(text: str, max_len: int = 40) -> str:
    trimmed = text.strip()
    if len(trimmed) <= max_len:
        return trimmed
    return trimmed[: max_len - 1] + "…"


class ChatService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings
        self._conversations = ConversationRepository(session)
        self._messages = MessageRepository(session)
        self._bedrock = BedrockService(settings)
        self._indexing = IndexingService(settings)

    async def stream_chat(
        self,
        *,
        user: User,
        content: str,
        conversation_id: uuid.UUID | None,
    ) -> AsyncIterator[str]:
        content = content.strip()
        if not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty message")

        conversation = None
        if conversation_id is not None:
            conversation = await self._conversations.get_by_id_for_user(conversation_id, user.id)
            if conversation is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        is_new = conversation is None
        if is_new:
            category = detect_category(content)
            conversation = await self._conversations.create(
                user_id=user.id,
                title=_truncate_title(content),
                category=category,
            )
            yield self._sse(
                ChatStreamEvent(
                    type="conversation",
                    conversation_id=conversation.id,
                    title=conversation.title,
                    category=conversation.category,
                )
            )

        user_message = await self._messages.create(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=content,
        )
        yield self._sse(
            ChatStreamEvent(
                type="user_message",
                conversation_id=conversation.id,
                message_id=user_message.id,
            )
        )

        # RAG: 현재 질문과 관련된 문서 청크 검색
        rag_hits = await self._indexing.search(content)
        rag_context: str | None = None
        if rag_hits:
            parts = [f"[문서 {i + 1}] {hit['content']}" for i, hit in enumerate(rag_hits)]
            rag_context = "\n\n".join(parts)

        history = await self._messages.list_for_conversation(conversation.id)
        bedrock_messages = [
            {
                "role": "user" if m.role == MessageRole.USER else "assistant",
                "content": m.content,
            }
            for m in history[:-1]
        ]
        bedrock_messages.append({"role": "user", "content": content})

        assistant_text_parts: list[str] = []
        async for chunk in self._bedrock.stream_completion(
            messages=bedrock_messages, rag_context=rag_context
        ):
            assistant_text_parts.append(chunk)
            yield self._sse(
                ChatStreamEvent(
                    type="delta",
                    conversation_id=conversation.id,
                    text=chunk,
                )
            )

        assistant_content = "".join(assistant_text_parts).strip()
        assistant_message = await self._messages.create(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=assistant_content or "(응답 없음)",
            source=None,
        )
        await self._conversations.touch(conversation)

        yield self._sse(
            ChatStreamEvent(
                type="done",
                conversation_id=conversation.id,
                message_id=assistant_message.id,
            )
        )

    @staticmethod
    def _sse(event: ChatStreamEvent) -> str:
        return f"data: {json.dumps(event.model_dump(mode='json'))}\n\n"
