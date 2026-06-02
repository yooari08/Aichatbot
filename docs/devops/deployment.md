# Deployment

## Architecture Overview

- Runtime platform: Rancher-managed Kubernetes
- Workloads:
  - `api` Deployment (FastAPI)
  - `postgres` StatefulSet + PVC
  - `chroma` Deployment + PVC
- Namespace: `ai-chatbot`

## Deployment Requirements

- Rancher 2.x + target cluster access
- Container registry for backend image
- Kubernetes StorageClass for persistent volumes
- Secret management path for DB/JWT/AWS credentials

## Release Flow

1. Build and push backend image
2. Update image tag in manifest
3. Apply manifests (`kubectl apply -k deploy/rancher/`) or Rancher UI/Fleet
4. Run deployment verification checklist
5. Promote/rollback based on checklist results

## Local Development Runtime

- Local backend indexing requires a running Chroma server at `CHROMA_HOST:CHROMA_PORT`.
- Recommended startup order:
  - `npm run dev:chroma`
  - `npm run dev:api`

## Infrastructure Dependencies

- PostgreSQL for transactional state
- Chroma for vector search
- AWS Bedrock runtime access for LLM completion
- Kubernetes ingress + TLS termination

## Operational Considerations

- Startup tasks currently include migration/bootstrap/retention purge
- For production stability:
  - separate migration into pre-deploy job
  - run retention as CronJob
  - isolate indexing workloads to async workers
- Add HPA and request/limit tuning for API pods

## Scaling Considerations

- API:
  - horizontal scale with stateless deployment
  - ensure DB pool sizing aligns with replica count
- Postgres:
  - migrate to managed service (RDS/Aurora) for production reliability
- Vector store:
  - evaluate HA strategy or pgvector migration

## Deployment Risks

- Risk: startup failure blocks entire pod rollout
  - Mitigation: move side-effectful startup tasks out of app lifecycle
- Risk: secrets misconfigured in cluster
  - Mitigation: preflight secret validation in CI/CD

## Deployment Verification Checklist

- Core health:
  - `GET /api/v1/health` returns `ok`
  - `GET /api/v1/ready` reports DB connectivity as healthy
- Auth and RBAC:
  - login (`/api/v1/auth/login`) works with valid credentials
  - non-admin token is rejected on `/api/v1/admin/*` endpoints (`403`)
  - admin token can access `/api/v1/admin/health` and monitoring endpoints
- RAG/Indexing:
  - document upload (`/api/v1/admin/documents/upload`) succeeds
  - index job status transitions to `succeeded` via `/api/v1/admin/documents/index-jobs`
- Chat runtime:
  - SSE stream (`/api/v1/chat/messages`) emits `conversation`, `user_message`, `delta`, `done`
  - Bedrock credential/runtime failure path returns fallback message without server crash
- Operations:
  - logs include startup DB/init/bootstrap outcomes
  - critical env vars (`DATABASE_URL`, `JWT_SECRET_KEY`, Bedrock settings) are present in target environment
