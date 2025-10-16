_Last updated: 2025-10-22 by gpt-5-codex_

# Row-Level Security (RLS)

Row-level security is enabled on `pl_site.comments` and `pl_site.contact_messages`. The `public.comments` view inherits the underlying rules while exposing only approved rows.

See SQL: [versions/2025-10-14t1830--rls-policies.sql](./versions/2025-10-14t1830--rls-policies.sql)

## Write (insert/update/delete)

- Only the Supabase service role (server-side) may perform writes.
- Public/anonymous roles cannot insert, update, or delete rows.

## Read (select)

- `comments`: public read (via the `public.comments` view) is limited to rows where `status = 'approved'` **and** `is_spam = false`.
- `contact_messages`: no public read; only the service role may select rows.

## Rationale

- Keep static pages static — new comments appear once they move from `pending` → `approved` without a rebuild.
- Preserve privacy for contact submissions.

## Verification Log

- 2025-10-21 (gpt-5-codex): Executed `select schemaname, tablename, policyname, permissive, roles from pg_policies where schemaname = 'pl_site';` using Supabase SQL editor; results logged in [verification/2025-10-15--rls-policies-check.md](./verification/2025-10-15--rls-policies-check.md).
