_Last updated: 2025-10-14 by PL_

# Governance

- Scope of this doc set: **documentation only**.
- Branch naming (for docs): `docs/*`.
- Review: Paula approves tone and structure; technical accuracy checked as needed.
- Versioning: optional tags for major content milestones.
- Backups: content and docs mirrored off-repo periodically.

## Data Stewardship

- **Owner:** Paula Livingstone
- **Database:** Supabase (Postgres) — single operator, no migration framework.
- **Schema changes:** committed SQL under `docs/db/versions/`, applied manually in Supabase.
- **Backups:** Supabase managed backups; optional exports stored in `docs/db/snapshots/`.

## Credentials

- Environment variable names are documented; values are never committed.
- Service role keys stay on the server and are rotated after sensitive changes or on schedule.
