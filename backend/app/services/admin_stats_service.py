"""Admin analytics stats — DB 집계 쿼리."""
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.document import Document, DocumentStatus
from app.models.message import Message, MessageRole
from app.models.user import User
from app.schemas.admin_stats import CategoryStat, DailyStat, StatsResponse


class AdminStatsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_stats(self) -> StatsResponse:
        now = datetime.now(UTC)

        # ── 이번 달 / 지난 달 경계 ──────────────────────────────
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_end = this_month_start - timedelta(seconds=1)
        last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # ── KPI: 이번 달 사용자 메시지 수 ──────────────────────
        this_month_msg = await self._count_messages_between(this_month_start, now)
        last_month_msg = await self._count_messages_between(last_month_start, last_month_end)

        # ── KPI: 활성 유저 수 ───────────────────────────────────
        active_users_result = await self._session.execute(
            select(func.count()).select_from(User).where(User.is_active == True)  # noqa: E712
        )
        active_users = int(active_users_result.scalar_one())

        # ── KPI: 문서 수 ────────────────────────────────────────
        total_docs_result = await self._session.execute(
            select(func.count()).select_from(Document)
        )
        total_docs = int(total_docs_result.scalar_one())

        indexed_docs_result = await self._session.execute(
            select(func.count())
            .select_from(Document)
            .where(Document.status == DocumentStatus.DONE)
        )
        indexed_docs = int(indexed_docs_result.scalar_one())

        # ── 카테고리별 대화 비율 ────────────────────────────────
        category_rows = await self._session.execute(
            select(
                func.coalesce(Conversation.category, "기타").label("category"),
                func.count().label("cnt"),
            )
            .group_by(func.coalesce(Conversation.category, "기타"))
            .order_by(func.count().desc())
        )
        cat_data = category_rows.all()
        total_convs = sum(r.cnt for r in cat_data) or 1
        category_breakdown = [
            CategoryStat(
                name=r.category,
                count=r.cnt,
                pct=round(r.cnt / total_convs * 100, 1),
            )
            for r in cat_data
        ]

        # ── 최근 30일 일별 메시지 수 ────────────────────────────
        thirty_days_ago = now - timedelta(days=29)
        daily_rows = await self._session.execute(
            select(
                func.date(Message.created_at).label("day"),
                func.count().label("cnt"),
            )
            .where(
                Message.role == MessageRole.USER,
                Message.created_at >= thirty_days_ago,
            )
            .group_by(func.date(Message.created_at))
            .order_by(func.date(Message.created_at))
        )
        daily_map: dict[str, int] = {str(r.day): r.cnt for r in daily_rows.all()}

        # 날짜 빈 값 채우기
        daily_messages: list[DailyStat] = []
        for i in range(30):
            d = (thirty_days_ago + timedelta(days=i)).date()
            key = d.isoformat()
            daily_messages.append(DailyStat(date=key, count=daily_map.get(key, 0)))

        # ── 자주 사용된 대화 제목 Top 5 ─────────────────────────
        top_rows = await self._session.execute(
            select(Conversation.title, func.count(Message.id).label("cnt"))
            .join(Message, Message.conversation_id == Conversation.id)
            .where(Message.role == MessageRole.USER)
            .group_by(Conversation.title)
            .order_by(func.count(Message.id).desc())
            .limit(5)
        )
        top_titles = [r.title for r in top_rows.all()]

        return StatsResponse(
            total_messages_this_month=this_month_msg,
            total_messages_last_month=last_month_msg,
            total_users_active=active_users,
            total_documents=total_docs,
            documents_indexed=indexed_docs,
            category_breakdown=category_breakdown,
            daily_messages=daily_messages,
            top_conversation_titles=top_titles,
        )

    async def _count_messages_between(self, start: datetime, end: datetime) -> int:
        result = await self._session.execute(
            select(func.count())
            .select_from(Message)
            .where(
                Message.role == MessageRole.USER,
                Message.created_at >= start,
                Message.created_at <= end,
            )
        )
        return int(result.scalar_one())
