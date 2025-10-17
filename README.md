_Last updated: 2025-10-14 by PL_

# Paula Livingstone Web Experience

This repository powers Paula Livingstone’s personal site and portfolio, combining writing, project highlights, and contact routes in one place.

All design, architecture, and content rules live in [`/docs/`](docs/), so start there when planning changes.

**Stack:** Next.js 15 app directory, React 19, Bootstrap utility layer, Framer Motion, next-themes, and custom SCSS tokens.
**Data layer:** Supabase (Postgres) for comments and contact records — see [`docs/09-database-and-services.md`](docs/09-database-and-services.md).

## Local development

Run the site locally:

```bash
npm run dev
```

Static export via `next export` is supported for CDN uploads once content stabilises.

For architecture, palette, and writing standards, see `/docs/`.

> **Quality Assurance:**
> Run `npm run ci:manual` before any release build. This command executes the complete test and lint pipeline locally. The repository has no remote CI runners by policy.
