from pathlib import Path

from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine, inspect

from alembic import command
from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)

ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"
HEAD_REVISION = "20260527_0004"
BASE_REVISION = "20260519_0001"


def _sync_database_url(database_url: str) -> str:
    return (
        database_url.replace("+asyncpg", "")
        .replace("postgresql+psycopg2", "postgresql")
        .replace("sqlite+aiosqlite", "sqlite")
    )


def _resolve_sqlite_path(database_url: str) -> Path | None:
    prefix = "sqlite+aiosqlite:///"
    if database_url.startswith(prefix):
        raw = database_url[len(prefix) :]
        return Path(raw.split("?")[0])
    return None


def _documents_schema_ok(inspector) -> bool:
    if "documents" not in inspector.get_table_names():
        return False
    for col in inspector.get_columns("documents"):
        if col["name"] in ("created_at", "updated_at"):
            default = str(col.get("default", "")).lower()
            if "now()" in default:
                return False
    return True


def _schema_matches_head(inspector, table_names: set[str]) -> bool:
    required = {"users", "conversations", "messages", "documents", "index_jobs"}
    if not required.issubset(table_names):
        return False
    user_columns = {col["name"] for col in inspector.get_columns("users")}
    return "external_id" in user_columns and _documents_schema_ok(inspector)


def run_alembic_upgrade(settings: Settings) -> None:
    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("sqlalchemy.url", settings.database_url)
    sync_url = _sync_database_url(settings.database_url)
    engine = create_engine(sync_url)

    with engine.connect() as conn:
        context = MigrationContext.configure(conn)
        current = context.get_current_revision()
        inspector = inspect(conn)
        table_names = set(inspector.get_table_names())

        if _schema_matches_head(inspector, table_names):
            if current != HEAD_REVISION:
                logger.info("Stamping database at head (schema already present)")
                command.stamp(cfg, HEAD_REVISION)
            return

        if current is None and table_names:
            if "users" in table_names:
                logger.info("Stamping legacy database at revision %s before upgrade", BASE_REVISION)
                command.stamp(cfg, BASE_REVISION)
            else:
                logger.info("Stamping empty-partial database at base revision")
                command.stamp(cfg, BASE_REVISION)

    command.upgrade(cfg, HEAD_REVISION)
    logger.info("Database migrations applied (head=%s)", HEAD_REVISION)


def recreate_sqlite_dev_database(settings: Settings) -> None:
    sqlite_path = _resolve_sqlite_path(settings.database_url)
    if sqlite_path is None:
        raise RuntimeError("Recreate is only supported for sqlite+aiosqlite URLs")

    if sqlite_path.exists():
        sqlite_path.unlink()
        logger.warning("Removed outdated SQLite file: %s", sqlite_path)

    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(cfg, HEAD_REVISION)
    logger.info("Recreated SQLite database with migrations")
