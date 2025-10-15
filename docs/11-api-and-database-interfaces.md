_Last updated: 2025-10-21 by gpt-5-codex_

# API and Database Interfaces

This document defines how Supabase powers live interactions (comments and contact) and how the Next.js app integrates with those services today. It covers endpoints, database tables, policies, and caching strategies.

## 1. Supabase Tables

### `comments`
- Stores visitor comments on blog posts.
- Key fields: `id`, `post_slug`, `author_name`, `author_email`, `body`, `created_at`, `status` (`pending`, `approved`, `spam`), `ip_hash`.
- Row Level Security (RLS): public read is allowed only when `status = 'approved' AND spam = false`. Inserts occur via server actions; no anonymous direct writes.
- Trigger maintains `post_comment_counts` (see below).

### `post_comment_counts`
- Materialised counter keyed by `post_slug`.
- Updated via Supabase trigger whenever an approved comment is added or removed.
- Used to render `comment_count` on blog index cards without scanning `comments`.

### `contact_messages`
- Stores messages submitted via `/contact`.
- Fields: `id`, `email`, `name`, `message`, `ip_hash`, `submitted_at`, `status` (`new`, `acknowledged`, `archived`).
- RLS permits select for service role only; no public read.

## 2. API Routes

### `GET /api/comments`
- Parameters: `slug` (required), `after` (optional cursor).
- Behaviour: returns approved comments in chronological order, keyset paginated using `after` cursor.
- Caching: `Cache-Control: public, s-maxage=60, stale-while-revalidate=600` to keep CDN fresh without hammering Supabase.
- Error handling: 400 for missing slug, 429 when rate limit is exceeded, 500 for unexpected errors with request ID logging.

### `POST /api/comments`
- Input: `slug`, `author`, `email`, `body`, `honeypot`, `submittedAt` (client timestamp for min submit time check).
- Flow: validates inputs, enforces honeypot empty, checks minimum dwell time, hashes IP, stores record as `pending`, and returns acknowledgement.
- Rate limiting: enforce per-IP + per-slug window via edge middleware or Supabase function.
- Sanitisation: HTML-sanitise `body` and trim whitespace.
- Moderation: notifications go to operators; manual approval flips `status` to `approved` for public visibility.

### `POST /api/contact`
- Input: `name`, `email`, `message`, `honeypot`, `submittedAt`.
- Flow mirrors comment submission but stores in `contact_messages` and sends operator notification.
- Rate limiting: per-IP and per-email window.
- Output: simple success confirmation; no public readback.

### (Future) Admin Endpoints
- Add authenticated routes for approving comments, marking spam, and acknowledging contact messages.
- Guard with Supabase Auth or Next.js middleware before exposing.

## 3. Client Integration

- Comments list and form components fetch from `/api/comments` and post via the same route.
- Contact form posts to `/api/contact` with optimistic UI acknowledgement.
- Supabase service role key is used server-side only; never expose in client bundles.

## 4. Observability & Logging

- Log request IDs, IP hashes, and outcomes for every POST. Store in application logs (Vercel/Edge) for traceability.
- Set up alerts for repeated rate-limit hits or spam surges.
- Maintain dashboards for pending comments and unread contact messages.

## 5. Security Posture

- RLS enforces read/write separation.
- All POST endpoints include honeypot field and minimum dwell time to reduce bot submissions.
- Inputs are HTML-sanitised before persistence and re-sanitised before rendering.
- Validate email addresses and limit message length to prevent abuse.

## 6. Performance Notes

- Fetch comments client-side after initial paint to keep SSG pages static.
- Use incremental revalidation (ISR) for blog index pages if comment counts need periodic refresh.
- Cache Supabase responses via `s-maxage` headers while respecting moderation delays.

Keep this document aligned with Supabase schema changes and API additions. Update together with `docs/09-database-and-services.md` when interfaces evolve.
