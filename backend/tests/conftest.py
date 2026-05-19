import os
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DB_AUTO_CREATE_TABLES", "true")
os.environ.setdefault("ALLOW_REGISTRATION", "true")
os.environ.setdefault("APP_ENV", "development")

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import close_db, get_engine, init_db
from app.models import User  # noqa: F401


@pytest.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    get_settings.cache_clear()
    settings = get_settings()
    await init_db(settings)
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await close_db()
    get_settings.cache_clear()


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client
