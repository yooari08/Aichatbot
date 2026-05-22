"""Manual verification for admin documents API (no pytest)."""

print('boot', flush=True)

import asyncio
print('asyncio', flush=True)
import os
import sys

os.environ.setdefault('JWT_SECRET_KEY', 'test-secret-key-at-least-32-characters-long')
print('env', flush=True)
os.environ.setdefault('DATABASE_URL', 'sqlite+aiosqlite:///:memory:')
os.environ.setdefault('DB_AUTO_CREATE_TABLES', 'true')
os.environ.setdefault('ALLOW_REGISTRATION', 'true')
os.environ.setdefault('APP_ENV', 'development')
os.environ.setdefault('BEDROCK_MOCK_ENABLED', 'true')
os.environ.setdefault('SEED_DEV_TEST_USERS', 'true')

print('httpx-import', flush=True)
from httpx import ASGITransport, AsyncClient
print('app-imports', flush=True)

from app.core.config import get_settings
print('config', flush=True)
from app.db.base import Base
print('base', flush=True)
from app.db.session import close_db, get_engine, get_session_factory, init_db
print('session', flush=True)
from app.models import Conversation, Document, IndexJob, Message, User  # noqa: F401
print('models', flush=True)
from app.repositories.user_repository import UserRepository
print('user_repo', flush=True)
from app.services.dev_users import seed_dev_test_users
print('dev_users', flush=True)


async def main() -> int:
    get_settings.cache_clear()
    settings = get_settings()
    await init_db(settings)
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with get_session_factory()() as session:
        await seed_dev_test_users(settings, UserRepository(session))
        await session.commit()

    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        login = await client.post(
            '/api/v1/auth/login',
            json={'email': 'admin@test.company.com', 'password': 'TestAdmin123!'},
        )
        assert login.status_code == 200, login.text
        headers = {'Authorization': f'Bearer {login.json()["access_token"]}'}

        create = await client.post(
            '/api/v1/admin/documents',
            headers=headers,
            json={
                'file_name': 'policy.pdf',
                'storage_path': '/data/documents/policy.pdf',
                'category': '정책',
                'owner_name': 'QA Admin',
            },
        )
        assert create.status_code == 201, create.text
        doc_id = create.json()['id']

        listing = await client.get('/api/v1/admin/documents', headers=headers)
        assert listing.status_code == 200
        assert any(row['id'] == doc_id for row in listing.json())

        jobs = await client.get('/api/v1/admin/documents/index-jobs', headers=headers)
        assert jobs.status_code == 200
        assert any(job['document_id'] == doc_id for job in jobs.json())

        forbidden = await client.get(
            '/api/v1/admin/documents',
            headers={
                'Authorization': f'Bearer {(await client.post("/api/v1/auth/login", json={"email": "user@test.company.com", "password": "TestUser123!"})).json()["access_token"]}'
            },
        )
        assert forbidden.status_code == 403

    await close_db()
    print('admin-api-check: OK')
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(asyncio.run(main()))
    except Exception as exc:
        print(f'admin-api-check: FAILED - {exc}', file=sys.stderr)
        raise
