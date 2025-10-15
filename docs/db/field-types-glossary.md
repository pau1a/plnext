_Last updated: 2025-10-14 by PL_

# Field Types Glossary

- `uuid`: unique primary keys generated via `gen_random_uuid()`.
- `text`: freeform strings; prefer `text` over `varchar` unless enforcing length limits.
- `timestamptz`: timezone-aware timestamps for all events.
- `boolean`: defaults to `false` for moderation or handling flags.

## Naming Conventions

- `created_at` marks creation time.
- `approved` / `handled` indicate moderation state.
