import json
import sys
import urllib.error
import urllib.request

BASE = 'http://127.0.0.1:8081/api/v1'


def request(method: str, path: str, *, token: str | None = None, body: dict | None = None) -> tuple[int, object]:
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    data = None if body is None else json.dumps(body).encode('utf-8')
    req = urllib.request.Request(f'{BASE}{path}', data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode('utf-8')
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode('utf-8')
        try:
            payload = json.loads(raw) if raw else {'detail': exc.reason}
        except json.JSONDecodeError:
            payload = {'detail': raw or exc.reason}
        return exc.code, payload


def main() -> int:
    status, token_body = request(
        'POST',
        '/auth/login',
        body={'email': 'admin@test.company.com', 'password': 'TestAdmin123!'},
    )
    if status != 200:
        print('login failed:', status, token_body)
        return 1
    token = token_body['access_token']

    status, created = request(
        'POST',
        '/admin/documents',
        token=token,
        body={
            'file_name': 'policy.pdf',
            'storage_path': '/data/documents/policy.pdf',
            'category': '정책',
            'owner_name': 'QA Admin',
        },
    )
    if status != 201:
        print('create failed:', status, created)
        return 1
    doc_id = created['id']

    status, listing = request('GET', '/admin/documents', token=token)
    if status != 200 or not any(row['id'] == doc_id for row in listing):
        print('list failed:', status, listing)
        return 1

    status, jobs = request('GET', '/admin/documents/index-jobs', token=token)
    if status != 200 or not any(job['document_id'] == doc_id for job in jobs):
        print('jobs failed:', status, jobs)
        return 1

    status, reindex = request(
        'POST',
        f'/admin/documents/{doc_id}/reindex',
        token=token,
        body={'message': 'manual reindex'},
    )
    if status != 200:
        print('reindex failed:', status, reindex)
        return 1

    status, _ = request('DELETE', f'/admin/documents/{doc_id}', token=token)
    if status != 204:
        print('delete failed:', status)
        return 1

    print('live-admin-api-check: OK')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
