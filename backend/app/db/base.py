from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase

# Portable timestamp default for SQLite (dev/tests) and PostgreSQL (prod).
CURRENT_TIMESTAMP = text("(CURRENT_TIMESTAMP)")


class Base(DeclarativeBase):
    pass
