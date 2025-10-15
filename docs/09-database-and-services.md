_Last updated: 2025-10-14 by PL_

# Data Layer Overview

Supabase (Postgres) provides the dynamic data layer for user-generated content such as blog comments and contact form submissions. MDX posts remain the canonical, static source for published content.

## Static vs Dynamic Boundary

- **Static content**: Authored in MDX, built at publish time, deployed as cacheable pages whose URLs are defined in the information architecture.
- **Dynamic data**: Stored in Supabase and accessed at runtime through server endpoints. Dynamic reads or writes never require a static site rebuild.

Include the static/dynamic boundary diagram here when it is ready.

## Principles

- Single operator; no migration framework.
- Schema changes are committed as dated SQL files in [docs/db/versions/](./db/versions/).
- Applied versions are tracked in the `pl_site.schema_version` table.
- Row-level security rules control read and write access by role.

## Setup

Follow these steps when provisioning a new environment or refreshing a Supabase project:

1. **Create the Supabase project**
   - Sign in to Supabase and create a new project named `paula-livingstone` (any region is acceptable; use the smallest free tier for testing).
   - Copy the project URL, anon key, and service role key from the Supabase dashboard.
   - Enable the Postgres schema extensions required by the SQL versions; no manual table creation is necessary beyond applying the scripts below.
   - Review and apply the row-level security policies described in [docs/db/policies.md](./db/policies.md) once the tables exist.

2. **Configure environment variables**
   - Duplicate [`../.env.example`](../.env.example) to `.env.local` (or to `.env` for hosted deployments).
   - Populate `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` with the values captured from the Supabase project.
   - Restart `npm run dev` after updating the file so Next.js picks up the credentials.

3. **Apply the SQL versions**
   - Open the Supabase SQL editor and apply each file in [docs/db/versions/](./db/versions/) sequentially (oldest to newest).
   - After running the scripts, confirm `select * from pl_site.schema_version;` returns the latest timestamp.
   - If a script introduces or updates policies, cross-check with [docs/db/policies.md](./db/policies.md) to ensure the expected behaviour is active.

## Terminology

- **Database**: Supabase (Postgres)
- **Storage**: CDN (`https://cdn.networklayer.co.uk/paulalivingstone/`)
- **Content**: MDX (static)

## Related Documentation

See [DB Operations](./db/README.md), [Data Layer Flow](./data-layer/flow.md), and [ADR 0003](./decisions/0003-adopt-supabase-no-migrations.md).
