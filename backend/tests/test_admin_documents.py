import pytest
from httpx import AsyncClient


async def _admin_token(client: AsyncClient) -> str:
    login = await client.post(
        '/api/v1/auth/login',
        json={'email': 'admin@test.company.com', 'password': 'TestAdmin123!'},
    )
    assert login.status_code == 200
    return login.json()['access_token']


@pytest.mark.asyncio
async def test_admin_documents_crud_and_index_jobs(client: AsyncClient) -> None:
    token = await _admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

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
    assert create.status_code == 201
    created = create.json()
    assert created['file_name'] == 'policy.pdf'
    assert created['status'] == 'processing'
    document_id = created['id']

    listing = await client.get('/api/v1/admin/documents', headers=headers)
    assert listing.status_code == 200
    assert any(row['id'] == document_id for row in listing.json())

    jobs = await client.get('/api/v1/admin/documents/index-jobs', headers=headers)
    assert jobs.status_code == 200
    assert any(job['document_id'] == document_id for job in jobs.json())

    reindex = await client.post(
        f'/api/v1/admin/documents/{document_id}/reindex',
        headers=headers,
        json={'message': 'manual reindex'},
    )
    assert reindex.status_code == 200
    assert reindex.json()['document_id'] == document_id
    assert reindex.json()['status'] == 'pending'

    delete = await client.delete(
        f'/api/v1/admin/documents/{document_id}',
        headers=headers,
    )
    assert delete.status_code == 204

    missing = await client.get('/api/v1/admin/documents', headers=headers, params={'q': 'policy.pdf'})
    assert missing.status_code == 200
    assert missing.json() == []


@pytest.mark.asyncio
async def test_admin_documents_forbidden_for_user(client: AsyncClient) -> None:
    login = await client.post(
        '/api/v1/auth/login',
        json={'email': 'user@test.company.com', 'password': 'TestUser123!'},
    )
    assert login.status_code == 200
    headers = {'Authorization': f'Bearer {login.json()["access_token"]}'}

    response = await client.get('/api/v1/admin/documents', headers=headers)
    assert response.status_code == 403
