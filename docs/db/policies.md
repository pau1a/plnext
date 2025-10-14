# Row-Level Security (RLS)

Row-level security is enabled on `pl_site.comments` and `pl_site.contact_messages`.

## Write (insert/update/delete)

- Only the Supabase service role (server-side) may perform writes.
- Public/anonymous roles cannot insert, update, or delete rows.

## Read (select)

- `comments`: public read is limited to rows where `approved = true`.
- `contact_messages`: no public read; only the service role may select rows.

## Rationale

- Keep static pages static — new comments appear once approved without a rebuild.
- Preserve privacy for contact submissions.
