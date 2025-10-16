_Last updated: 2025-10-22 by gpt-5-codex_

# Schema (pl_site)

## Tables

### pl_site.comments
- `id`: `uuid` primary key, default `gen_random_uuid()`.
- `slug`: `text` not null. Mirrors the blog post slug.
- `author_name`: `text` not null. Display name supplied by the reader.
- `author_email`: `text` null. Stored for moderation follow-up only.
- `content`: `text` not null. HTML-sanitised body captured from the form.
- `status`: `text` not null default `'pending'`. Enum constraint: `'pending'`, `'approved'`, `'rejected'`, `'spam'`.
- `ip_hash`: `text` not null. SHA-256 hash of the submitting IP (rate limiting & abuse triage).
- `user_agent`: `text` null. Optional browser fingerprint for abuse reports.
- `is_spam`: `boolean` not null default `false`. Flip when confirmed spam to short-circuit moderation queues.
- `created_at`: `timestamptz` not null default `now()`.
- `updated_at`: `timestamptz` not null default `now()`.
- `moderated_at`: `timestamptz` null. Set when `status` changes from the default.

**Indexes**
- `ix_comments_slug_created_at` on `(slug, created_at asc)` for keyset pagination.
- `ix_comments_status_created_at` on `(status, created_at desc)` for moderation queue views.

**Triggers**
- `comments_set_updated_at` — maintains `updated_at` on any update.
- `comments_sync_counts` — refreshes `pl_site.post_comment_counts` whenever an approved comment is inserted/updated/deleted.

### pl_site.post_comment_counts
- `slug`: `text` primary key.
- `approved_count`: `integer` not null default `0`.
- `last_approved_at`: `timestamptz` null. Timestamp of the most recent approved comment.
- `updated_at`: `timestamptz` not null default `now()`.

**Usage**
- Acts as a materialised counter so the blog index can show comment totals without scanning `pl_site.comments` on every render.
- Maintained exclusively by the `comments_sync_counts` trigger; no direct writes. Rows are deleted when a slug has zero approved comments.

### pl_site.contact_messages
- `id`: `uuid` primary key, default `gen_random_uuid()`.
- `name`: `text` not null.
- `email`: `text` not null.
- `message`: `text` not null.
- `status`: `text` not null default `'new'`. Enum constraint: `'new'`, `'acknowledged'`, `'archived'`, `'spam'`.
- `ip_hash`: `text` not null. SHA-256 hash of the submitting IP.
- `user_agent`: `text` null. Captured for abuse correlation.
- `created_at`: `timestamptz` not null default `now()`.
- `updated_at`: `timestamptz` not null default `now()`.
- `acknowledged_at`: `timestamptz` null. Timestamp recorded when status first leaves `'new'`.

**Indexes**
- `ix_contact_messages_status_created_at` on `(status, created_at desc)` for queue ordering.
- `ix_contact_messages_created_at` on `(created_at desc)` for chronological review.

**Triggers**
- `contact_messages_set_updated_at` — maintains `updated_at` on updates.
- `contact_messages_set_acknowledged_at` — timestamps the first acknowledgement transition.

### pl_site.schema_version
- `id`: `int` primary key default `1`
- `version`: `text` (timestamp-style string, e.g. `2025-10-14T1800`)

## Views

### public.comments
- Projection exposed to the application and CDN caches.
- Columns: `id`, `slug`, `author`, `content`, `created_at`.
- Backed by `pl_site.comments` with `status = 'approved' AND is_spam = false`.
- Grants: `anon` and `authenticated` roles receive `select` privileges.
- Purpose: keeps reader-facing payload slim (no email/IP metadata) while enforcing moderation state.

## Conventions

- Use `snake_case` column names.
- Store events as `timestamptz`.
- Default timestamps to `now()`.
- Use `uuid` primary keys.

## Sample Queries

### Comments moderation flow
```sql
-- Pending comment ready for review
select id, author_name, content, created_at
from pl_site.comments
where slug = 'my-post-slug' and status = 'pending'
order by created_at asc;
```

```sql
-- Approve a comment (trigger updates post_comment_counts)
update pl_site.comments
set status = 'approved',
    moderated_at = now(),
    updated_at = now()
where id = '00000000-0000-0000-0000-000000000000';
```

```sql
-- Public view exposed via `public.comments`
select id, slug, author, content, created_at
from public.comments
where slug = 'my-post-slug'
order by created_at asc;
```

### Comment counter maintenance
```sql
select slug, approved_count, last_approved_at
from pl_site.post_comment_counts
where slug = 'my-post-slug';
```

### Contact message handling
```sql
insert into pl_site.contact_messages (name, email, message, ip_hash)
values ('Bob', 'bob@example.com', 'Hello', 'SHA256-OF-IP');
```

```sql
update pl_site.contact_messages
set status = 'acknowledged',
    acknowledged_at = coalesce(acknowledged_at, now()),
    updated_at = now()
where id = '00000000-0000-0000-0000-000000000000';
```

```sql
select id, name, email, message, created_at
from pl_site.contact_messages
where status in ('new', 'acknowledged')
order by created_at desc;
```

Validated on 2025-10-22 via manual schema review. Supabase service-role credentials are not available in this environment, so sample data inserts and query execution could not be performed.
