_Last updated: 2025-10-21 by gpt-5-codex_

# Site Structure Overview

This document captures the canonical public routes, page responsibilities, and build order for Paula Livingstone’s site. It is the authoritative reference for how the application is shaped today and how it should scale as more posts, projects, and interactive features come online.

## 1. Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Home — hero, intro, work pillars, featured posts, ethos, and a contact call to action. |
| `/about` | Biography, guiding values, and a short professional timeline. |
| `/projects` | Project index (cards) with status badges → links to detail pages. |
| `/projects/[slug]` | Project detail MDX. |
| `/blog` | Paginated blog index (12 per page) with filters for year, tags (when enabled), and series. |
| `/blog/[slug]` | Blog post detail (MDX, metadata, comments, and prev/next links). |
| `/blog/archive` | Archive landing page with a yearly grid. |
| `/blog/archive/[year]` | Year-specific archive showing slugs and dates. |
| `/blog/series` | Series hub listing available series. |
| `/blog/series/[series-slug]` | Ordered list of posts within a series. |
| `/blog/search` | Client-side full-text search endpoint (optional; enable when ready). |
| `/blog/tags` | Tag registry (hidden until tags are turned on). |
| `/blog/tags/[tag-slug]` | Posts filtered by tag (hidden until tags are live). |
| `/contact` | Email context and contact form (Supabase). |
| `/privacy`, `/terms` | Static legal pages. |
| `/rss.xml`, `/sitemap.xml` | Feeds generated from the MDX corpus. |

**Principle:** Blog post URLs are always `/blog/[slug]`. Categories and tags are filters, never path elements, to preserve stable canonical URLs.

## 2. Navigation & Footer

- **Header:** Logo, About, Projects, Blog, Contact, and a theme toggle. Keep top-level navigation minimal and stable.
- **Footer:** Copyright line, RSS link, privacy policy, and a back-to-top shortcut.

## 3. Blog Information Architecture

- `/blog` lists twelve posts per page using keyset pagination for fast, stable paging at scale.
- Cards include title, publish date, excerpt, and `comment_count` sourced from Supabase counters.
- `/blog/[slug]` renders MDX with optional table of contents, metadata (date, reading time, tags/series), approved comments, comment form, and next/previous links (series-first, then chronology).
- `/blog/archive` and `/blog/archive/[year]` provide quick navigation without rendering full content.
- Series support lives in front matter (`series.title`, `series.order`) and surfaces on `/blog/series` routes when present.

## 4. Projects Information Architecture

- `/projects` renders MDX-backed project cards with status badges (`active`, `archived`, etc.).
- `/projects/[slug]` serves MDX content with links, imagery, and an optional “Learnings” section. Comments stay on the blog to centralise discussion.

## 5. API Touchpoints

- `/api/comments` handles GET (approved comments with keyset pagination) and POST (create pending comment with rate limiting, honeypot, and sanitisation).
- `/api/contact` accepts POST requests for contact form submissions with rate limiting.
- Admin moderation endpoints will arrive later and require authentication.

## 6. Performance & Search Practices

- Blog and project pages are statically generated; comments fetch client-side so new discussion does not trigger rebuilds.
- Keyset pagination powers both UI and database access for stability with 200+ posts.
- Feeds (`/rss.xml`, `/sitemap.xml`) derive from the MDX index.
- Optional search can load a local static index (Fuse.js) or query Supabase full-text search when enabled.

## 7. Build Order Checklist

1. Global layout, design tokens, navigation, and footer.
2. Home page sections (Hero → Contact CTA).
3. MDX pipeline and blog index/detail SSG.
4. Supabase APIs and comment UI (list/form, counters).
5. Archive, tags (stubbed), and series pages.
6. SEO, sitemap, RSS, JSON-LD, and accessibility pass.

Treat this as the foundation release map. Any future routes or structural deviations should start as a change request here before code lands.
