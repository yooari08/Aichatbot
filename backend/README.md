# AI Chatbot API (FastAPI)

Enterprise internal AI chatbot platform backend.

## Stack

- FastAPI + Uvicorn
- PostgreSQL (planned)
- Chroma (planned)
- AWS Bedrock (planned)
- **Deployment: Rancher-managed Kubernetes** (no Docker Compose)

## Local development

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate  # Linux/macOS

pip install -e ".[dev]"
cp .env.example .env
# Edit .env — JWT_SECRET_KEY is required (min 32 characters)

uvicorn app.main:app --reload --port 8080
```

- API docs: http://localhost:8080/docs
- Health: http://localhost:8080/api/v1/health

### Connect to cluster services (optional)

Port-forward Postgres/Chroma from the Rancher cluster:

```bash
kubectl -n ai-chatbot port-forward svc/postgres 5432:5432
kubectl -n ai-chatbot port-forward svc/chroma 8000:8000
```

## Database migrations

```bash
# With Postgres running (Rancher port-forward or local)
alembic upgrade head
```

## Auth API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register (disabled unless `ALLOW_REGISTRATION=true`) |
| POST | `/api/v1/auth/login` | JWT login |
| GET | `/api/v1/auth/me` | Current user (`Authorization: Bearer`) |

Roles: `user`, `admin` (RBAC via `require_roles()` dependency).

`users.external_id` — reserved for upcoming SAML/OIDC (`sub`).

## Chat API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/conversations` | List conversations (last 90 days retained) |
| GET | `/api/v1/conversations/{id}` | Conversation + messages |
| PATCH | `/api/v1/conversations/{id}` | Rename / pin |
| DELETE | `/api/v1/conversations/{id}` | Delete |
| POST | `/api/v1/chat/messages` | **SSE** stream — send message, receive deltas |

SSE event types: `conversation`, `user_message`, `delta`, `done`.

Bedrock model default: `anthropic.claude-sonnet-4-6`. Set `BEDROCK_MOCK_ENABLED=true` for local dev without AWS.

## Tests

```bash
pip install -e ".[dev]"
pytest
```

## Container image

```bash
docker build -t ai-chatbot-api:local ./backend
```

## Rancher deployment

Manifests live under `deploy/rancher/`. See [deploy/rancher/README.md](../deploy/rancher/README.md).

## Project layout

```
app/
  api/          # Routers (versioned)
  core/         # Config, logging
  schemas/      # Pydantic DTOs
  services/     # Business logic (future)
  repositories/ # Data access (future)
  main.py
```
