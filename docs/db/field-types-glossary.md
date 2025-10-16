_Last updated: 2025-10-22 by gpt-5-codex_

# Field Types Glossary

- `uuid`: unique primary keys generated via `gen_random_uuid()`.
- `text`: freeform strings; prefer `text` over `varchar` unless enforcing length limits.
- `timestamptz`: timezone-aware timestamps for all events.
- `boolean`: defaults to `false` for moderation flags (`is_spam`).
- `text enum`: constrain via `check` for workflow states (e.g., comment `status` in `('pending','approved','rejected','spam')`).

## Naming Conventions

- `created_at` marks creation time.
- Use `status` columns to track workflow, paired with timestamp columns (`moderated_at`, `acknowledged_at`).
