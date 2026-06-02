# Vector Search

## Current Implementation

- Engine: Chroma HTTP client
- Collection: `CHROMA_COLLECTION` (default `enterprise_kb`)
- Similarity space: cosine
- Query call:
  - input: user message text
  - output: `documents`, `metadatas`, `distances`
  - default top-k: `5`

## Metadata Model

- Stored metadata per chunk:
  - `doc_id`
  - `chunk_index`
  - optional document context fields from ingestion path

## Retrieval Quality Controls

- Current:
  - fixed `n_results=5`
  - no distance threshold filtering
- Recommended:
  - apply max-distance cutoff for low relevance
  - add metadata filter by `category` where applicable
  - expose retrieval tuning in config

## Performance Considerations

- Use persistent Chroma storage (PVC in Kubernetes)
- Keep chunk size/overlap tuned to balance recall and prompt token cost
- Cache hot queries if repeated patterns emerge

## Failure Modes

- Chroma unavailable:
  - service logs warning
  - returns empty retrieval results
  - chat continues in non-RAG mode
- Operational risk:
  - silent quality degradation if vector retrieval is down
- Mitigation:
  - add health check for Chroma
  - add alert on retrieval miss-rate anomalies

## Migration Path to pgvector

- Stack target includes pgvector; current state uses Chroma
- Migration strategy:
  1. introduce vector repository interface
  2. dual-write indexes to Chroma + pgvector
  3. compare retrieval quality/latency
  4. switch read path to pgvector
  5. decommission Chroma after validation window
