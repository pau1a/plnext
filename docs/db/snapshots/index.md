_Last updated: 2025-10-22 by gpt-5-codex_
# Snapshots
Store full SQL exports here after significant schema changes.
File name format: `YYYY-MM-DD--full-export.sql`.

## 2025-10-15
- File: `2025-10-15--full-export.sql`
- Schema version: `2025-10-14T1830`
- Context: Exported from Supabase (`pg_dump` via SQL editor download) immediately after applying `2025-10-14t1830--rls-policies.sql`. Checksums recorded below.
- SHA256: `3c8e5b327be8456b46a37d06fdf38abf0f1d44ad3328857c4049286409205c6a`

> **Stage 4 note:** This snapshot predates the manual uplift documented in [db/index.md](../index.md). Capture a new export once the schema upgrades (status fields, counters, view) are live in Supabase.
