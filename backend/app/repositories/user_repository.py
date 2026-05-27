import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.message import Message, MessageRole
from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self._session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        normalized = email.strip().lower()
        result = await self._session.execute(select(User).where(User.email == normalized))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        email: str,
        hashed_password: str,
        role: UserRole = UserRole.USER,
    ) -> User:
        user = User(
            email=email.strip().lower(),
            hashed_password=hashed_password,
            role=role,
            is_active=True,
        )
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def count(self) -> int:
        result = await self._session.execute(select(func.count()).select_from(User))
        return int(result.scalar_one())

    async def list_with_message_counts(self) -> list[tuple[User, int]]:
        """모든 유저와 각 유저의 전체 사용자 메시지 수를 함께 조회."""
        # User → Conversation → Message(role=user) LEFT JOIN
        msg_count_subq = (
            select(
                Conversation.user_id,
                func.count(Message.id).label("msg_count"),
            )
            .join(Message, Message.conversation_id == Conversation.id)
            .where(Message.role == MessageRole.USER)
            .group_by(Conversation.user_id)
            .subquery()
        )

        result = await self._session.execute(
            select(User, func.coalesce(msg_count_subq.c.msg_count, 0).label("msg_count"))
            .outerjoin(msg_count_subq, msg_count_subq.c.user_id == User.id)
            .order_by(User.created_at.desc())
        )
        return [(row.User, int(row.msg_count)) for row in result.all()]

    async def count_active(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(User).where(User.is_active == True)  # noqa: E712
        )
        return int(result.scalar_one())
