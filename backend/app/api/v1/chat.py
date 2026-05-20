from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, DbSession, SettingsDep
from app.schemas.chat import ChatMessageRequest
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/messages")
async def send_message_stream(
    payload: ChatMessageRequest,
    user: CurrentUser,
    session: DbSession,
    settings: SettingsDep,
) -> StreamingResponse:
    service = ChatService(session, settings)

    async def event_stream():
        async for chunk in service.stream_chat(
            user=user,
            content=payload.content,
            conversation_id=payload.conversation_id,
        ):
            yield chunk

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
