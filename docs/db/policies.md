_Last updated: 2025-10-14 by PL_

# Row-Level Security (RLS)

Row-level security is enabled on `pl_site.comments` and `pl_site.contact_messages`.

See SQL: [versions/2025-10-14T1830--rls-policies.sql](./versions/2025-10-14T1830--rls-policies.sql)

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

- 2025-10-15 (gpt-5-codex): Unable to run `select * from pg_policies where schemaname = 'pl_site';` — missing Supabase credentials and `psql` client in this environment. See [verification/2025-10-15--rls-policies-check.md](./verification/2025-10-15--rls-policies-check.md) for the recorded attempt and comparison notes.
