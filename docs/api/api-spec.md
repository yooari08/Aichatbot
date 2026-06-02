# API Specification

## Architecture Overview

- Base URL prefix: `/api/v1`
- Framework: FastAPI (async endpoint + async DB session)
- Auth: JWT Bearer (`Authorization: Bearer <token>`)
- Streaming: Chat endpoint uses Server-Sent Events (`text/event-stream`)
- RBAC: Admin endpoints require `admin` role via dependency guard

## API Contracts

### Health

#### `GET /health`
- Purpose: Liveness check
- Auth: None

Response example:
```json
{
  "status": "ok",
  "service": "ai-chatbot-api",
  "environment": "development"
}
```

#### `GET /ready`
- Purpose: Readiness check (API + Postgres status)
- Auth: None

Response example:
```json
{
  "status": "degraded",
  "checks": {
    "api": "ok",
    "postgres": "unavailable",
    "chroma": "pending"
  }
}
```

### Authentication

#### `POST /auth/login`
- Purpose: Issue JWT token
- Auth: None

Request example:
```json
{
  "email": "user@test.company.com",
  "password": "TestUser123!"
}
```

Response example:
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### `POST /auth/register`
- Purpose: Register user (`ALLOW_REGISTRATION=true` required)
- Auth: None

Request example:
```json
{
  "email": "new.user@company.com",
  "password": "StrongPassword123!",
  "role": "user"
}
```

#### `GET /auth/me`
- Purpose: Current user profile
- Auth: Bearer

### Conversations

#### `GET /conversations`
- Purpose: List current user conversations
- Auth: Bearer

#### `GET /conversations/{conversation_id}`
- Purpose: Conversation detail with message list
- Auth: Bearer

#### `PATCH /conversations/{conversation_id}`
- Purpose: Update title/pinned
- Auth: Bearer

Request example:
```json
{
  "title": "복지 정책 문의",
  "pinned": true
}
```

#### `DELETE /conversations/{conversation_id}`
- Purpose: Delete conversation (cascade messages)
- Auth: Bearer

### Chat (SSE)

#### `POST /chat/messages`
- Purpose: Send a user message and stream assistant output
- Auth: Bearer
- Content-Type: `application/json`

Request example:
```json
{
  "conversation_id": null,
  "content": "연차 정책 알려줘"
}
```

SSE event payload example:
```json
{
  "type": "delta",
  "conversation_id": "11111111-2222-3333-4444-555555555555",
  "text": "연차 정책은 ..."
}
```

Event types:
- `conversation`
- `user_message`
- `delta`
- `done`

### Admin - Users

#### `GET /admin/users`
- Purpose: User list + message counts (optional email query: `q`)
- Auth: Bearer + `admin`

### Admin - Stats

#### `GET /admin/stats`
- Purpose: Dashboard statistics
- Auth: Bearer + `admin`

### Admin - Monitoring

#### `GET /admin/health`
- Purpose: Admin health check
- Auth: Bearer + `admin`

#### `GET /admin/monitoring/conversations`
- Purpose: Recent conversation monitoring (`q`, `limit`)
- Auth: Bearer + `admin`

### Admin - Documents / Indexing

#### `GET /admin/documents`
- Purpose: List indexed documents (`category`, `status`, `q`)
- Auth: Bearer + `admin`

#### `POST /admin/documents`
- Purpose: Create document metadata and index from inline content
- Auth: Bearer + `admin`

Request example:
```json
{
  "file_name": "policy.txt",
  "storage_path": "/tmp/policy.txt",
  "category": "hr",
  "owner_name": "HR Team",
  "content": "문서 본문 ..."
}
```

#### `POST /admin/documents/upload`
- Purpose: Upload file and index
- Auth: Bearer + `admin`
- Content-Type: `multipart/form-data` (`file`, `category`, `owner_name`)

#### `GET /admin/documents/index-jobs`
- Purpose: List index jobs (`document_id`, `status`, `limit`)
- Auth: Bearer + `admin`

#### `POST /admin/documents/{document_id}/reindex`
- Purpose: Reindex an existing document
- Auth: Bearer + `admin`

#### `DELETE /admin/documents/{document_id}`
- Purpose: Delete document and vector index
- Auth: Bearer + `admin`

## Error Contract

- Unified response model (`ErrorResponse`):
```json
{
  "detail": "Validation error",
  "code": "validation_error",
  "errors": []
}
```
- Common statuses: `400`, `401`, `403`, `404`, `422`, `500`
- Runtime behavior by environment:
  - `422` validation errors use unified `ErrorResponse` in all environments
  - `4xx` errors raised by app/router handlers are normalized to `ErrorResponse`
  - Unhandled `500` exceptions are explicitly normalized only when `APP_ENV != production`
  - In production, upstream/runtime defaults may apply for unexpected unhandled errors

## Operational Considerations

- SSE clients must handle reconnect/timeouts.
- For production, keep `/docs` disabled by `APP_ENV=production`.
- API contract changes must be backward-compatible or explicitly versioned.
