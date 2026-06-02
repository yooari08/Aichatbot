# Environment Configuration

## Configuration Overview

- Source: environment variables (`backend/.env` for local, K8s ConfigMap/Secret for cluster)
- Loader: Pydantic `BaseSettings`
- Principle: non-secret in ConfigMap, secret in Secret manager

## Core Variables

### Application

- `APP_NAME`
- `APP_ENV` (`development` | `staging` | `production`)
- `LOG_LEVEL`
- `API_V1_PREFIX`

### Database

- `DATABASE_URL` (async SQLAlchemy URL)
- `DB_AUTO_CREATE_TABLES`
- `RUN_MIGRATIONS_ON_STARTUP`

### Authentication

- `JWT_SECRET_KEY` (required, min length 32)
- `JWT_ALGORITHM`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `ALLOW_REGISTRATION`
- `ALLOW_ADMIN_REGISTRATION`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `SEED_DEV_TEST_USERS` (dev test user/admin 자동 시드 여부)
- `DEV_TEST_USER_EMAIL`
- `DEV_TEST_USER_PASSWORD`
- `DEV_TEST_ADMIN_EMAIL`
- `DEV_TEST_ADMIN_PASSWORD`

### Bedrock

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID` (local/dev only when needed)
- `AWS_SECRET_ACCESS_KEY` (local/dev only when needed)
- `AWS_SESSION_TOKEN` (temporary credentials only)
- `BEDROCK_MODEL_ID`
- `BEDROCK_MOCK_ENABLED`
- `BEDROCK_MAX_TOKENS`
- `BEDROCK_TEMPERATURE`

### RAG / Storage / CORS

- `CHROMA_HOST`
- `CHROMA_PORT`
- `CHROMA_COLLECTION`
- `DOCUMENTS_STORAGE_PATH`
- `CONVERSATION_RETENTION_DAYS`
- `CORS_ORIGINS` (comma-separated list)

## Security Requirements

- Never commit real secrets
- Prefer workload identity to static AWS keys in production
- Rotate JWT/AWS credentials via secret management policy

## Deployment Mapping

- Local: `backend/.env`
- Kubernetes:
  - ConfigMap for non-sensitive values
  - Secret for credentials and tokens

## Validation and Failure Modes

- Invalid `JWT_SECRET_KEY` length fails settings validation
- Invalid DB URL causes startup DB init failure
- Missing Bedrock credentials when mock disabled causes runtime model call failures
- Chroma server not running at `CHROMA_HOST:CHROMA_PORT` causes document indexing failures

## Operational Notes

- Keep environment values versioned by stage (`dev`, `staging`, `prod`)
- Use immutable image + explicit env set per release
- Stage recommendations:
  - `SEED_DEV_TEST_USERS=true` only for local development
  - `SEED_DEV_TEST_USERS=false` for staging/production
  - `DEV_TEST_*` credentials should never be used in shared environments
