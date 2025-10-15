_Last updated: 2025-10-14 by PL_

# Schema (pl_site)

## Tables

### pl_site.comments
- `id`: `uuid` primary key, default `gen_random_uuid()`
- `post_slug`: `text` not null
- `name`: `text` not null
- `email`: `text`
- `body`: `text` not null
- `created_at`: `timestamptz` default `now()`
- `approved`: `boolean` default `false` (not listed until approved)

**Indexes**
- `ix_comments_post_slug_created_at` on `(post_slug, created_at desc)`

### pl_site.contact_messages
- `id`: `uuid` primary key, default `gen_random_uuid()`
- `name`: `text` not null
- `email`: `text` not null
- `subject`: `text`
- `body`: `text` not null
- `created_at`: `timestamptz` default `now()`
- `handled`: `boolean` default `false`

**Indexes**
- `ix_contact_messages_created_at` on `(created_at desc)`

### pl_site.schema_version
- `id`: `int` primary key default `1`
- `version`: `text` (timestamp-style string, e.g. `2025-10-14T1800`)

## Conventions

- Use `snake_case` column names.
- Store events as `timestamptz`.
- Default timestamps to `now()`.
- Use `uuid` primary keys.

## Sample Queries

### Comments moderation flow
```sql
select id, name, body, created_at
from pl_site.comments
where post_slug = 'my-post-slug' and approved = true
order by created_at desc;
```

```sql
insert into pl_site.comments (post_slug, name, email, body)
values ('my-post-slug', 'Alice', 'alice@example.com', 'Great post!');
```

```sql
update pl_site.comments
set approved = true
where id = '00000000-0000-0000-0000-000000000000';
```

### Contact message handling
```sql
insert into pl_site.contact_messages (name, email, subject, body)
values ('Bob', 'bob@example.com', 'Hello', 'Message body');
```

```sql
select id, name, email, subject, created_at
from pl_site.contact_messages
where handled = false
order by created_at desc;
```
