from datetime import UTC, datetime

from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase

# Portable timestamp default for SQLite (dev/tests) and PostgreSQL (prod).
CURRENT_TIMESTAMP = text("(CURRENT_TIMESTAMP)")


def utc_now() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass
