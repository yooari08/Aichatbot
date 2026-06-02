# Logging and Monitoring

## Logging Architecture

- Current logger: Python `logging` with stdout sink
- Format:
  - `%(asctime)s %(levelname)s %(name)s %(message)s`
- Startup logging configured once at app lifespan
- Helper `log_context(...)` exists for structured field extension

## Current Coverage

- Startup/shutdown lifecycle logs
- Bedrock stream failure logs with exception stack
- Chroma indexing/search success/failure logs

## Monitoring Endpoints

- `GET /api/v1/health` for liveness
- `GET /api/v1/ready` for readiness (API + DB check, Chroma placeholder)
- Admin monitoring APIs for conversation/operator visibility

## Gaps and Recommendations

- Structured JSON logging not yet enabled
  - recommendation: adopt JSON formatter and correlation IDs
- No metrics export yet
  - recommendation: add Prometheus metrics endpoint
- No alerting policy documented
  - recommendation: define SLO/SLI for:
    - API latency/error rate
    - Bedrock error rate
    - retrieval success ratio
    - indexing job failure rate

## Operational Considerations

- Ensure log aggregation in cluster (e.g., Fluent Bit + Datadog/ELK)
- Redact sensitive data (tokens, credentials, PII) at log boundary
- Add audit logs for admin operations

## Scaling Considerations

- Add request tracing for async flows (chat SSE + external model call)
- Add per-component dashboards (API, DB, Chroma, Bedrock dependency status)
