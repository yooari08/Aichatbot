# RAG Pipeline

## Architecture Overview

- Goal: Improve answer grounding for enterprise internal knowledge
- Current components:
  - Ingestion: Admin document APIs
  - Chunking: Fixed-size text chunking
  - Retrieval: Chroma similarity search
  - Generation: AWS Bedrock Claude (or mock mode)

## Ingestion Flow

1. Admin creates document (`POST /admin/documents`) or uploads file (`POST /admin/documents/upload`)
2. `documents` row created with `processing` status
3. `index_jobs` row created with `running` status
4. Content indexed into vector store
5. Status transitions:
   - success: `documents.done`, `index_jobs.succeeded`
   - failure: `documents.failed`, `index_jobs.failed`

## Chunking Strategy

- Current implementation:
  - chunk size: `800`
  - chunk overlap: `100`
- Characteristics:
  - deterministic slicing by character length
  - simple and predictable behavior
- Tradeoffs:
  - language/semantic boundaries are not preserved
  - long structured docs may lose context continuity
- Next improvements:
  - semantic chunking by heading/section
  - per-document-type chunk policy

## Embedding/Indexing Flow

- Current behavior:
  - Chroma `collection.upsert` with document chunks + metadata (`doc_id`, `chunk_index`)
  - collection metadata uses cosine similarity
- Index identity:
  - id format: `<doc_id>::<chunk_index>::<chunk_hash>`
- Delete:
  - delete by `where={"doc_id": <id>}`

## Retrieval Flow

1. User sends chat message
2. Query text used for vector search (`n_results=5`)
3. Retrieved chunks concatenated into prompt context
4. Context attached in Bedrock system prompt

## Citation Handling (Current vs Target)

- Current:
  - chunks are appended as context text only
  - assistant message `source` field is reserved but currently null in chat flow
- Target:
  - include citation metadata in response (document name/chunk index)
  - persist citation links in `messages.source` or dedicated citation table

## Hallucination Mitigation

- Current controls:
  - system prompt instructs model not to invent policy details
  - fallback message on Bedrock failure
- Gaps:
  - no confidence scoring
  - no explicit “insufficient evidence” thresholding
- Recommended:
  - distance threshold for retrieval acceptance
  - answer policy: if low evidence, return clarification + official source prompt

## Prompt Injection Defense (Current vs Required)

- Current:
  - retrieved chunks are passed to model context without dedicated sanitization layer
  - no policy classifier for malicious/override instructions inside documents
- Risks:
  - retrieved content can contain instruction overrides ("ignore previous instructions")
  - sensitive internal text may be surfaced without classification-aware filtering
- Required controls:
  - pre-context sanitization:
    - strip/flag instruction-like patterns from retrieved chunks
    - attach chunk provenance metadata (`doc_id`, `chunk_index`) for auditability
  - retrieval policy filter:
    - allowlist by document category/classification per user role
    - block retrieval from restricted classes unless explicitly authorized
  - post-generation response filter:
    - detect sensitive patterns (credentials, tokens, internal-only identifiers)
    - replace with safe fallback + citation request path
  - incident visibility:
    - structured logs for blocked chunks, filtered responses, and policy rule hits

## Low-Confidence Fallback

- Current fallback:
  - on Bedrock exception, stream a user-friendly failure hint
- Recommended fallback extension:
  - retrieval low-confidence fallback
  - model uncertainty fallback template
  - route to human/support escalation when needed

## RAG Security and Quality Verification Checklist

- Retrieval safety:
  - malicious instruction text in a test document does not alter system behavior
  - restricted-category documents are not retrieved for unauthorized roles
- Response safety:
  - sensitive patterns are redacted/blocked by post-filter policy
  - low-confidence retrieval path returns explicit uncertainty guidance
- Operational correctness:
  - indexing failures transition `documents.failed` and `index_jobs.failed`
  - search degradation (Chroma failure) falls back safely without API crash
- Observability:
  - logs include retrieval source metadata for answered responses
  - policy blocks and fallback events are traceable in monitoring

## Operational Considerations

- Chroma dependency failure currently degrades to non-RAG answer path
- Monitor index job failures and chunk counts per document
- Ensure uploaded content extraction quality (currently UTF-8 decode with ignore)

## Scaling Considerations

- As corpus grows:
  - tune `n_results` and chunk strategy
  - evaluate pgvector-based ANN and metadata filtering
  - add background workers for indexing throughput isolation
