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

## Terminology

- **Database**: Supabase (Postgres)
- **Storage**: CDN (`https://cdn.networklayer.co.uk/paulalivingstone/`)
- **Content**: MDX (static)

## Related Documentation

See [DB Operations](./db/README.md), [Data Layer Flow](./data-layer/flow.md), and [ADR 0003](./decisions/0003-adopt-supabase-no-migrations.md).
