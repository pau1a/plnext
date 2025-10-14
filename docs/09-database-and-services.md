# Data Layer Overview

Supabase (Postgres) provides the dynamic data layer for user-generated content such as blog comments and contact form submissions. MDX posts remain the canonical, static source for published content.

## Static vs Dynamic Boundary

- **Static content**: Authored in MDX, built at publish time, deployed as cacheable pages whose URLs are defined in the information architecture.
- **Dynamic data**: Stored in Supabase and accessed at runtime through server endpoints. Dynamic reads or writes never require a static site rebuild.

Include the static/dynamic boundary diagram here when it is ready.

## Principles

- Single operator; no migration framework.
- Schema changes are committed as dated SQL files in `docs/db/versions/`.
- Applied versions are tracked in the `pl_site.schema_version` table.
- Row-level security rules control read and write access by role.

## Terminology

- **Database**: Supabase (Postgres)
- **Storage**: CDN (`https://cdn.networklayer.co.uk/paulalivingstone/`)
- **Content**: MDX (static)

## Related Documentation

- `docs/db/` — schema, policies, change process.
- `docs/data-layer/flow.md` — dynamic data flow for comments and contact forms.
- `docs/decisions/0003-adopt-supabase-no-migrations.md` — architectural decision record.
