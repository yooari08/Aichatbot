"""메시지 피드백 엔드포인트."""
import uuid

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.api.deps import CurrentUser, DbSession
from app.models.message import Message

router = APIRouter(prefix="/messages", tags=["messages"])


class FeedbackRequest(BaseModel):
    value: bool | None


@router.post("/{message_id}/feedback", status_code=status.HTTP_204_NO_CONTENT)
async def submit_feedback(
    message_id: uuid.UUID,
    payload: FeedbackRequest,
    user: CurrentUser,
    session: DbSession,
) -> None:
    message = await session.get(Message, message_id)
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    message.feedback = payload.value
    await session.commit()
