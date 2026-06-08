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
async def test_login_failure_creates_audit_log(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@test.company.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401

    token = await _admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    audit = await client.get(
        "/api/v1/admin/audit-log",
        params={"action": "LOGIN_FAILED", "q": "user@test.company.com"},
        headers=headers,
    )
    assert audit.status_code == 200
    body = audit.json()
    assert body["total"] >= 1
    assert body["items"][0]["action"] == "LOGIN_FAILED"
    assert body["items"][0]["detail"] == "invalid credentials"


@pytest.mark.asyncio
async def test_successful_login_creates_audit_log(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/login",
        json={"email": "user@test.company.com", "password": "TestUser123!"},
    )

    token = await _admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    audit = await client.get(
        "/api/v1/admin/audit-log",
        params={"action": "LOGIN", "q": "user@test.company.com"},
        headers=headers,
    )
    assert audit.status_code == 200
    body = audit.json()
    assert body["total"] >= 1
    assert body["items"][0]["action"] == "LOGIN"


@pytest.mark.asyncio
async def test_admin_invite_user_creates_audit_log(client: AsyncClient) -> None:
    token = await _admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    invite = await client.post(
        "/api/v1/admin/users",
        headers=headers,
        json={
            "email": "invited@company.com",
            "password": "InvitePass123!",
            "role": "user",
        },
    )
    assert invite.status_code == 201

    audit = await client.get(
        "/api/v1/admin/audit-log",
        params={"action": "CREATE"},
        headers=headers,
    )
    assert audit.status_code == 200
    body = audit.json()
    assert any("invited@company.com" in (item.get("detail") or "") for item in body["items"])


@pytest.mark.asyncio
async def test_audit_log_requires_admin(client: AsyncClient) -> None:
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@test.company.com", "password": "TestUser123!"},
    )
    token = login.json()["access_token"]
    response = await client.get(
        "/api/v1/admin/audit-log",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
