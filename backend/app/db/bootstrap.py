from app.core.config import Settings
from app.core.logging import get_logger
from app.db.base import Base
from app.db.session import get_engine
from app.models import Conversation, Message, User  # noqa: F401 — register models

logger = get_logger(__name__)


async def create_tables(settings: Settings) -> None:
    if not settings.db_auto_create_tables:
        return
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured (auto-create enabled)")
