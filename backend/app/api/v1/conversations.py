import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.chat import ConversationDetail, ConversationSummary, ConversationUpdate
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationSummary])
async def list_conversations(
    user: CurrentUser,
    session: DbSession,
) -> list[ConversationSummary]:
    return await ConversationService(session).list_summaries(user)


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: uuid.UUID,
    user: CurrentUser,
    session: DbSession,
) -> ConversationDetail:
    return await ConversationService(session).get_detail(user, conversation_id)


@router.patch("/{conversation_id}", response_model=ConversationSummary)
async def update_conversation(
    conversation_id: uuid.UUID,
    payload: ConversationUpdate,
    user: CurrentUser,
    session: DbSession,
) -> ConversationSummary:
    return await ConversationService(session).update(user, conversation_id, payload)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: uuid.UUID,
    user: CurrentUser,
    session: DbSession,
) -> None:
    await ConversationService(session).delete(user, conversation_id)
