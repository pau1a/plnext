_Last updated: 2025-10-14 by PL_

# Taxonomies — Tags now, Categories later

**Now**

- Use tags freely in posts (e.g., "ot","ml","pytorch","resilience").

Tag listing pages will be statically generated from the collected tag set during the build. Each unique tag resolves to `/tags/[slug]`, keeping generation deterministic without requiring runtime lookups.

**Later**

- Categories will be added after ~1 year of posts.
- Keep `categorySlug` optional in front-matter.
- Categories get their own listing URLs (`/blog/category/[slug]`).
- We’ll keep a central registry (title, slug, description, color).

Rationale: categorisation emerges from actual writing patterns. [See ADR 0002](../decisions/0002-categories-later.md).
