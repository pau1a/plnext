_Last updated: 2025-10-23 by gpt-5-codex_

# Privacy & Security (Baseline)

- Contact: minimal data; server-side validation; rate limiting; spam protection.
- Analytics: PostHog configured in cookieless mode with explicit opt-in banner and footer preferences.
- Legal stubs to add pre-launch: /privacy, /terms.
- Security headers intent: HTTPS only; HSTS; basic CSP (tighten later).

Paula Livingstone operates as the sole steward for Supabase access, which keeps schema changes and credential custody centralized with her. See [Governance](./07-governance.md) for the full stewardship breakdown and operational procedures.

## Comments
- Submission: stored immediately in Supabase with `status='pending'` and a hashed IP (`ip_hash`).
- Publication: visible publicly only after Paula sets `status='approved'` (and `is_spam=false`).
- Removal: on request, delete the comment row in Supabase and clear any cached copies.
  1. Locate the record: `select id, author_email from pl_site.comments where slug = 'POST_SLUG' and id = 'UUID';`
  2. Confirm the requester matches `author_email` (or admin request).
  3. Remove the record: `delete from pl_site.comments where id = 'UUID';`
  4. Invalidate cached views (ISR pages, CDN, browser storage) for the affected slug to prevent stale content from resurfacing.

## Contact Messages
- Private by default; never displayed publicly.
- Submission: stored with `status='new'`, hashed IP (`ip_hash`), and captured `user_agent` for abuse triage.
- Handling: transition `status` from `new` → `acknowledged` → `archived` (or `spam`) and retain for correspondence history unless deletion is requested.
- Removal: honor data subject deletion or anonymisation requests.
  1. Validate the requester by matching email headers or stored metadata.
  2. If deletion is requested, run `delete from pl_site.contact_messages where id = 'UUID';`
  3. If anonymisation is requested, update identifying fields instead: `update pl_site.contact_messages set email = null, name = null, message = '[anonymised]' where id = 'UUID';`
  4. Clear any downstream caches or search indexes fed by contact data (e.g., admin dashboards) to ensure the removal propagates immediately.

## Data Subject Requests
- Accept removal or export requests via email.
- Record fulfillment steps (date, requester, row id, action) in an internal log.

