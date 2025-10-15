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
- **Schema changes:** committed SQL under [docs/db/versions/](./db/versions/), applied manually in Supabase.
- **Backups:** see [Backups & Retention](#backups--retention).

## Credentials

- Environment variable names are documented; values are never committed.
- Service role keys stay on the server and are rotated after sensitive changes or on schedule.

## Backups & Retention

- Supabase automated backups run daily and are retained for 30 days (per Supabase plan).
- After any schema change, export a full SQL snapshot and store it under [docs/db/snapshots/](./db/snapshots/) as `YYYY-MM-DD--full-export.sql`.
- For recovery, restore from the latest Supabase backup first; if unavailable, load the newest snapshot and apply remaining files in [docs/db/versions/](./db/versions/) (`*.sql`) in order.
