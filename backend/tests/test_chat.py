import json

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_chat_stream_creates_conversation(client: AsyncClient) -> None:
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@test.company.com", "password": "TestUser123!"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    async with client.stream(
        "POST",
        "/api/v1/chat/messages",
        json={"content": "연차 규정 알려줘"},
        headers=headers,
    ) as response:
        assert response.status_code == 200
        events: list[dict] = []
        async for line in response.aiter_lines():
            if not line.startswith("data: "):
                continue
            events.append(json.loads(line[6:]))

    types = [e["type"] for e in events]
    assert "conversation" in types
    assert "delta" in types
    assert "done" in types

    conversation_id = next(e["conversation_id"] for e in events if e["type"] == "conversation")

    list_resp = await client.get("/api/v1/conversations", headers=headers)
    assert list_resp.status_code == 200
    assert any(c["id"] == conversation_id for c in list_resp.json())
