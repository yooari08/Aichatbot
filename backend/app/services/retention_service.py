from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.logging import get_logger
from app.repositories.conversation_repository import ConversationRepository

logger = get_logger(__name__)


async def purge_expired_conversations(session: AsyncSession, settings: Settings) -> int:
    cutoff = datetime.now(UTC) - timedelta(days=settings.conversation_retention_days)
    deleted = await ConversationRepository(session).delete_all_older_than(cutoff)
    if deleted:
        logger.info(
            "Purged %s conversations older than %s days",
            deleted,
            settings.conversation_retention_days,
        )
    return deleted
