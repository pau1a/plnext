_Last updated: 2025-10-21 by gpt-5-codex_

# Row-Level Security (RLS)

Row-level security is enabled on `pl_site.comments` and `pl_site.contact_messages`.

See SQL: [versions/2025-10-14t1830--rls-policies.sql](./versions/2025-10-14t1830--rls-policies.sql)

## Write (insert/update/delete)

- Only the Supabase service role (server-side) may perform writes.
- Public/anonymous roles cannot insert, update, or delete rows.

## Read (select)

- `comments`: public read is limited to rows where `approved = true`.
- `contact_messages`: no public read; only the service role may select rows.

## Rationale

- Keep static pages static — new comments appear once approved without a rebuild.
- Preserve privacy for contact submissions.

## Verification Log

- 2025-10-21 (gpt-5-codex): Executed `select schemaname, tablename, policyname, permissive, roles from pg_policies where schemaname = 'pl_site';` using Supabase SQL editor; results logged in [verification/2025-10-15--rls-policies-check.md](./verification/2025-10-15--rls-policies-check.md).
