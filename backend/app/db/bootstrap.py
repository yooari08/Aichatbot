import asyncio

from app.core.config import Settings
from app.core.logging import get_logger
from app.db.base import Base
from app.db.migrate import recreate_sqlite_dev_database, run_alembic_upgrade
from app.db.session import get_engine
from app.models import Conversation, Document, IndexJob, Message, User  # noqa: F401 — register models

logger = get_logger(__name__)


async def create_tables(settings: Settings) -> None:
    if not settings.db_auto_create_tables:
        return
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured (auto-create enabled)")


async def prepare_database(settings: Settings) -> None:
    if settings.run_migrations_on_startup:
        try:
            await asyncio.to_thread(run_alembic_upgrade, settings)
            return
        except Exception as exc:
            logger.error("Alembic migration failed: %s", exc)
            if "sqlite" in settings.database_url and settings.app_env == "development":
                await asyncio.to_thread(recreate_sqlite_dev_database, settings)
                return
            raise

    if settings.db_auto_create_tables:
        await create_tables(settings)
