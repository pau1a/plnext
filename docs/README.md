_Last updated: 2025-10-14 by PL_

# PaulaLivingstone — Project Documentation

This folder is the operating manual for the site. It captures purpose, structure, content models, design rules, and decisions.  
Scope: **docs only** — no build or code tasks live here.

**Start here:**

1. 01-purpose-and-scope.md
2. 02-information-architecture.md
3. 03-content-model/blog.md and project.md
4. 04-design-system-baseline/*
## UI Architecture
- [ui/00-front-page-architecture.md](./ui/00-front-page-architecture.md)
- [ui/01-front-page-content-style.md](./ui/01-front-page-content-style.md)


## Data Layer
- [09-database-and-services.md](./09-database-and-services.md)
- DB:
  - [db/README.md](./db/README.md)
  - [db/schema.md](./db/schema.md)
  - [db/policies.md](./db/policies.md)
  - [db/field-types-glossary.md](./db/field-types-glossary.md)
  - [db/snapshots/README.md](./db/snapshots/README.md)
- Flow:
  - [data-layer/flow.md](./data-layer/flow.md)

## Environment
- [env/variables.md](./env/variables.md)

## Decisions
- [decisions/0001-url-strategy.md](./decisions/0001-url-strategy.md) — Blog posts live at `/blog/[slug]`; taxonomy tweaks never change canonical URLs.
- [decisions/0002-categories-later.md](./decisions/0002-categories-later.md) — Defer formal categories; rely on tags until the content library matures.
- [decisions/0003-adopt-supabase-no-migrations.md](./decisions/0003-adopt-supabase-no-migrations.md) — Use Supabase with manually tracked SQL versions instead of a migrations framework.

## Housekeeping Log
- 2025-10-15: Attempted to coordinate with Ged for an orphan/duplicate file review of the `docs/` tree. Direct confirmation could not be secured within this environment, so the review remains pending follow-up.
- 2025-10-15: Ran `npx markdown-link-check -p docs`; initial pass flagged four dead links (one internal path, two missing palette placeholders, one private CDN URL). Updated the docs to fix the internal reference, convert the restricted CDN location to inline code, and replace the missing palette images with a follow-up note. Re-ran the command and confirmed all links are healthy.

