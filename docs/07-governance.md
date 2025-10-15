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
- Service role keys stay on the server and are rotated after sensitive changes and at least every 90 days.

## Backups & Retention

- Supabase automated backups run daily and are retained for 30 days (per Supabase plan).
- After any schema change, export a full SQL snapshot and store it under [docs/db/snapshots/](./db/snapshots/) as `YYYY-MM-DD--full-export.sql`.
- For recovery, restore from the latest Supabase backup first; if unavailable, load the newest snapshot and apply remaining files in [docs/db/versions/](./db/versions/) (`*.sql`) in order.

## Access & Audit Log Review

- **Frequency:** Review Supabase access and audit logs on the first business day of each month, and after any security incident.
- **Scope:** Confirm that administrative logins, privilege escalations, schema changes, and unusual query volumes align with approved changes.
- **Retention:** Keep the native Supabase logs for 90 days (platform default). Export reviewed logs quarterly and store the CSV extracts for 18 months.
- **Archival location:** Upload quarterly exports to the encrypted "Supabase Logs" folder in the shared compliance Google Drive; limit access to Paula and the on-call engineering lead.
- **Documentation:** Record findings and follow-up actions in the "Log Reviews" section of the internal governance tracker (Notion) for traceability.
