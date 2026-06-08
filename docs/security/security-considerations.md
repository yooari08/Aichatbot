# Security Considerations

## Input Validation

- Current:
  - Pydantic schema validation for JSON/form fields
  - field-level constraints (length/email)
- Required hardening:
  - upload MIME type allowlist
  - upload size limits
  - filename/content scanning policy

## Upload Security

- Current:
  - server-side generated storage name with UUID prefix
  - path traversal protection via `Path(file_name).name`
- Gaps:
  - no antivirus/malware scan
  - decode uses `errors="ignore"` (silent text corruption risk)
- Recommendation:
  - enforce file type policy + extraction pipeline with explicit failures

## Prompt Injection / Data Leakage

- Current:
  - system prompt asks model not to invent policy details
  - retrieved chunks are directly injected into model context
- Risks:
  - malicious document content can instruct model override
  - sensitive chunks could be surfaced without policy filtering
- Recommendation:
  - context sanitization layer
  - policy-based retrieval filters (role/category/classification)
  - response post-filter for sensitive patterns

## Secrets and Environment

- Current:
  - secrets loaded from environment
  - AWS keys optional for local, IAM role intended for production
- Mandatory production controls:
  - no plaintext secrets in repo
  - secret rotation policy
  - workload identity (IRSA or equivalent)

## RBAC and Access Boundaries

- Current:
  - role-based guards for admin endpoints
  - user-scoped conversation reads
- Verification checklist:
  - ensure every new admin endpoint has explicit role guard
  - ensure repository queries enforce tenant boundary by user id

## Transport and Network

- Required:
  - HTTPS/TLS via ingress
  - internal network policy: API -> Postgres/Chroma only
  - no public exposure of database/vector services

## Audit and Monitoring

- Current (implemented):
  - `audit_log` table persists admin user actions (invite, role/status change)
  - successful login (`LOGIN`) and failed login (`LOGIN_FAILED`) with IP address
  - admin-only read API: `GET /api/v1/admin/audit-log`
- Gaps:
  - denied RBAC access (403) not yet persisted to audit_log
  - admin document/indexing actions not yet audited
  - no automated alerting on repeated `LOGIN_FAILED` spikes
- Recommendation:
  - extend audit coverage to document CRUD and RBAC denials
  - alert on `LOGIN_FAILED` rate threshold per IP/email
