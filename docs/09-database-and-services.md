_Last updated: 2025-10-14 by PL_

# Data Layer Overview

Supabase (Postgres) provides the dynamic data layer for user-generated content such as blog comments and contact form submissions. MDX posts remain the canonical, static source for published content.

## Static vs Dynamic Boundary

```mermaid
flowchart LR
    subgraph Static [Static authoring & build]
        A[MDX content in repo]\n(Content model fields) --> B[Next.js build step]\n(Including ISR paths)
    end
    subgraph Delivery [Edge delivery]
        B --> C[CDN \n https://cdn.networklayer.co.uk/paulalivingstone/]
        C --> D[Browser cache]
    end
    subgraph Dynamic [Runtime services]
        E[Supabase tables]\n(comments, contact_messages) --> F[Moderation & governance]
    end
    D -.->|reader interaction| G[Dynamic endpoints]\n(Next.js server actions / API routes)
    G -->|writes| E
    G -->|reads approved data| D
    F -->|approvals update rows| E
```

The boundary line is drawn where the static build hands off to cached delivery: anything produced by the MDX build (see [Content Model — Blog Posts](./03-content-model/blog.md)) is versioned and published via the CDN, while any reader-generated or reviewer-generated change happens after the page is served. Dynamic interactions use Supabase to store state, and the Next.js server mediates those requests without triggering a rebuild.

- **Publishing:** Updating MDX triggers a rebuild and pushes new assets through the CDN invalidation process described in [CDN Invalidation Workflow](./05-cdn-and-assets-invalidation.md).
- **Moderation:** Supabase holds pending comments and contact messages until Paula approves them. Roles and stewardship expectations are set in [Governance](./07-governance.md).
- **Privacy:** Handling, retention, and removal of user data follow the policies in [Privacy & Security](./08-privacy-and-security.md).
- **Operational flow:** For detailed runtime steps (forms, approvals, caching), see [Data Flow (Comments and Contact)](./data-layer/flow.md).

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

See [DB Operations](./db/README.md), [Data Layer Flow](./data-layer/flow.md), [CDN Invalidation Workflow](./05-cdn-and-assets-invalidation.md), and [ADR 0003](./decisions/0003-adopt-supabase-no-migrations.md).
