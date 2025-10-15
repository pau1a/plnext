_Last updated: 2025-10-21 by gpt-5-codex_

# Governance

- Scope of this doc set: **documentation only**.
- Branch naming (for docs): `docs/*`.
- Review: Paula approves tone and structure; technical accuracy checked as needed.
- Change control: every documentation pull request requires Paula’s approval plus one technical reviewer before merge.
- Versioning: optional tags for major content milestones.
- Backups: content and docs mirrored off-repo periodically.

## Data Stewardship

- **Owner:** Paula Livingstone
- **Database:** Supabase (Postgres) — single operator, no migration framework.
- **Schema changes:** committed SQL under [docs/db/versions/](./db/versions/), applied manually in Supabase.
- **Backups:** see [Backups & Retention](#backups--retention).

## Static Content & CDN Stewardship

- **Owner:** Paula Livingstone (content), Ged (technical oversight).
- **Source of truth:** MDX content in the repository (`/src/content`). Copy edits follow [01-front-page-content-style.md](./ui/01-front-page-content-style.md).
- **Design references:** Align component usage with [04-design-system-baseline/index.md](./04-design-system-baseline/index.md) and linked palette/typography docs.
- **Deployment:** Static assets publish via Next.js build; follow [05-cdn-and-assets-invalidation.md](./05-cdn-and-assets-invalidation.md) immediately after deploys and moderation approvals.
- **Cache management:** Paula triggers CDN purges (dashboard or API) and records them in the moderation log. Ged ensures API keys (`NETWORKLAYER_API_KEY`) stay rotated and scoped.
- **Accessibility & SEO:** Cross-check updates with [06-seo-and-metadata.md](./06-seo-and-metadata.md) and [ui/00-front-page-architecture.md](./ui/00-front-page-architecture.md) to guarantee parity between narrative intent and implementation.

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
