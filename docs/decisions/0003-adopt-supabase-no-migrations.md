_Last updated: 2025-10-15 by PL_
# ADR 0003 — Adopt Supabase (No Migrations Framework)

## Status
Accepted

## Context
Dynamic features such as comments and contact form submissions require persistence. The site has a single operator and no need for an automated migration framework.

## Decision
Use Supabase (Postgres) as the shared data service. Track schema changes as dated SQL files in `docs/db/versions/`, applying them manually and recording the active version in `pl_site.schema_version`.

## Consequences
- Minimal tooling overhead while ensuring reproducible change history.
- Backups rely on Supabase exports plus optional snapshots checked into `docs/db/snapshots/`.
- If the team grows or automation is required, revisit this ADR.
