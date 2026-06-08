# Database Schema

## Architecture Overview

- Primary DB: PostgreSQL (SQLAlchemy async ORM)
- Migration tool: Alembic
- Local fallback: SQLite (`sqlite+aiosqlite`) for development
- Core domains:
  - identity (`users`)
  - chat session (`conversations`, `messages`)
  - RAG admin (`documents`, `index_jobs`)

## Entity Relationships

- `users (1) -> (N) conversations`
- `conversations (1) -> (N) messages`
- `documents (1) -> (N) index_jobs`
- Deletion:
  - deleting user cascades conversations
  - deleting conversation cascades messages
  - deleting document cascades index_jobs

## Tables

### users

- `id` UUID PK
- `email` varchar(255), unique, indexed
- `external_id` varchar(255), unique, nullable (reserved for SSO)
- `hashed_password` varchar(255)
- `role` enum(`user`, `admin`)
- `is_active` boolean
- `created_at`, `updated_at` timestamptz

### conversations

- `id` UUID PK
- `user_id` UUID FK -> `users.id`
- `title` varchar(255)
- `category` varchar(32), nullable
- `pinned` boolean
- `created_at`, `updated_at` timestamptz

### messages

- `id` UUID PK
- `conversation_id` UUID FK -> `conversations.id`
- `role` enum(`user`, `assistant`)
- `content` text
- `source` text, nullable (citation/source reserve)
- `feedback` boolean, nullable — `true`=positive, `false`=negative, `null`=no feedback
- `created_at` timestamptz

Migration: `20260605_0001_add_feedback_to_messages`

### documents

- `id` UUID PK
- `file_name` varchar(255)
- `storage_path` varchar(1024)
- `category` varchar(64), nullable, indexed
- `owner_name` varchar(128), nullable
- `status` enum(`processing`, `done`, `failed`) indexed
- `error_message` text, nullable
- `created_at`, `updated_at` timestamptz

### index_jobs

- `id` UUID PK
- `document_id` UUID FK -> `documents.id`
- `status` enum(`pending`, `running`, `succeeded`, `failed`) indexed
- `message` text, nullable
- `created_at`, `updated_at` timestamptz

### audit_log

- `id` UUID PK
- `user_id` UUID FK → `users.id` (ondelete=SET NULL, nullable)
- `user_email` varchar(255), nullable (사용자 삭제 후에도 이메일 보존)
- `action` varchar(16) — `CREATE` | `UPDATE` | `DELETE` | `LOGIN` | `LOGIN_FAILED`
- `resource_type` varchar(64), nullable
- `resource_id` varchar(255), nullable
- `detail` text, nullable
- `ip_address` varchar(64), nullable
- `created_at` timestamptz

Migration: `20260605_0002_add_audit_log_table`

## Query Performance Notes

- Existing index coverage:
  - `users.email`, `users.external_id`
  - `conversations.user_id`, `conversations.updated_at`
  - `messages.conversation_id`, `messages.created_at`
  - `documents.category`, `documents.status`, `documents.created_at`
  - `index_jobs.document_id`, `index_jobs.status`, `index_jobs.created_at`
- For larger scale, consider:
  - composite index on `(conversations.user_id, conversations.updated_at desc)`
  - composite index on `(messages.conversation_id, messages.created_at)`
  - partition/archival strategy for `messages`

## Data Retention

- Conversation retention configured by `CONVERSATION_RETENTION_DAYS`
- Purge job currently runs on API startup
- Production recommendation: move retention purge to scheduled job/CronJob

## Operational Considerations

- Startup can run migrations automatically (`RUN_MIGRATIONS_ON_STARTUP=true`)
- Production recommendation:
  - disable runtime auto-migration in app startup
  - run migration in CI/CD pipeline with controlled rollout
- Backup:
  - Postgres snapshot/PITR policy required before production go-live

## Scaling Considerations

- Hot table growth expected in `messages`
- Use read replicas and connection pooling once QPS increases
- For heavy analytics, avoid OLTP overload; ship events to warehouse
