from pydantic import BaseModel


class CategoryStat(BaseModel):
    name: str
    count: int
    pct: float


class FeedbackEntry(BaseModel):
    id: str
    message_id: str
    user_email: str
    value: bool
    conversation_title: str
    message_preview: str
    created_at: str


class FeedbackStatsResponse(BaseModel):
    total_positive: int
    total_negative: int
    total_this_month: int
    total_last_month: int
    satisfaction_rate: float
    recent_feedback: list[FeedbackEntry]


class DailyStat(BaseModel):
    date: str   # "YYYY-MM-DD"
    count: int


class StatsResponse(BaseModel):
    # KPI 카드
    total_messages_this_month: int
    total_messages_last_month: int
    total_users_active: int
    total_documents: int
    documents_indexed: int

    # 카테고리별 대화 비율
    category_breakdown: list[CategoryStat]

    # 최근 30일 일별 메시지 수 (차트용)
    daily_messages: list[DailyStat]

    # 자주 사용된 대화 제목 Top 5 (질문 프록시)
    top_conversation_titles: list[str]
