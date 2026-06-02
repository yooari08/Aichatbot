# Architecture Decisions

## ADR-001: Layered Backend Structure

- Status: Accepted
- Decision:
  - Separate `api` (router), `services` (business), `repositories` (data access), `schemas` (DTO)
- Why:
  - Maintainability and testability
  - Clear async responsibility boundaries
- Tradeoffs:
  - Slightly more boilerplate
  - Better long-term scalability than fat routers

## ADR-002: Async-First FastAPI + Async SQLAlchemy

- Status: Accepted
- Decision:
  - Use async endpoints, async DB session, and non-blocking flows
- Why:
  - Better concurrent request handling
  - Good fit for streaming chat and external AI calls
- Risks:
  - Blocking code inside async path can degrade throughput
- Mitigation:
  - Wrap blocking I/O in `asyncio.to_thread` (already used in indexing/file operations)

## ADR-003: JWT + RBAC for Internal Platform

- Status: Accepted
- Decision:
  - JWT access token with role claim (`user`, `admin`)
  - RBAC guard via dependency (`require_roles`)
- Why:
  - Simple and explicit API-level access control
  - Low operational overhead for internal platform phase
- Future:
  - Integrate SSO (`external_id`) with OIDC/SAML

## ADR-004: RAG Vector Store via Chroma (Current)

- Status: Accepted (interim)
- Decision:
  - Document chunks indexed in Chroma collection
  - App DB stores document/index-job metadata
- Why:
  - Fast implementation for internal search augmentation
- Tradeoffs:
  - Not yet using pgvector although stack target includes it
- Future:
  - Evaluate migration to PostgreSQL + pgvector for operational unification

## ADR-005: Rancher-Managed Kubernetes Deployment

- Status: Accepted
- Decision:
  - Deploy API/Postgres/Chroma via Kubernetes manifests under `deploy/rancher`
- Why:
  - Enterprise operational standards (RBAC, secret mgmt, scaling, observability)
- Requirements:
  - External secret handling
  - TLS ingress and network policies

## ADR-006: Startup Bootstrap Tasks (Current)

- Status: Accepted (needs split later)
- Decision:
  - Startup includes DB init/migration, admin bootstrap, dev seed, retention purge
- Why:
  - Reduce setup friction in early stage
- Risks:
  - Longer startup time, possible failure amplification
- Future:
  - Separate admin bootstrap/retention into jobs or maintenance workers

## Operational Architecture Overview

- Request path: Client -> FastAPI router -> service -> repository -> Postgres
- Chat path: Client -> SSE endpoint -> ChatService -> Bedrock + Chroma search -> message persistence
- Admin doc path: upload/create -> metadata persist -> index job record -> chunk/index -> status update
