import pytest
from httpx import AsyncClient


async def _admin_token(client: AsyncClient) -> str:
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.company.com", "password": "TestAdmin123!"},
    )
    assert login.status_code == 200
    return login.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_health_and_monitoring(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_db_check(*args, **kwargs) -> bool:
        return True

    async def fake_search(*args, **kwargs):
        return []

    monkeypatch.setattr("app.services.admin_monitoring_service.check_database", fake_db_check)
    monkeypatch.setattr("app.services.indexing_service.IndexingService.search", fake_search)

    token = await _admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    health = await client.get("/api/v1/admin/health", headers=headers)
    assert health.status_code == 200
    health_body = health.json()
    assert "checks" in health_body
    assert "postgres" in health_body["checks"]
    assert "chroma" in health_body["checks"]

    monitoring = await client.get("/api/v1/admin/monitoring/conversations", headers=headers)
    assert monitoring.status_code == 200
    body = monitoring.json()
    assert "items" in body
    assert "total" in body
