_Last updated: 2025-10-22 by gpt-5-codex_

# DB Operations (Single Operator, No Migrations)

Authoritative SQL change files live in [docs/db/versions/](./versions/).

> **Pre-1.0 note:** During the build we are not shipping incremental migrations. Paula updates the Supabase project directly with whatever schema adjustments are needed, and we capture the latest shape in `schema.md`. The version stamps become relevant once we cut a 1.0 release and lock the migration history. Until then, treat the SQL files in `versions/` as reference material for recreating the database from scratch, not as a strict, sequential migration history.
>
> Stage 4 introduced material changes (status fields, IP hashing, counters, and public views) that are applied manually. Follow the runbook below after applying the dated `versions/*.sql` files.

Schema spec: [schema.md](./schema.md) • Policies: [policies.md](./policies.md) • Versions: [versions/](./versions/) • Snapshots: [snapshots/](./snapshots/)

## Change Application (Manual)

1. Open the Supabase SQL editor for the PaulaLivingstone project.
2. Run each newer `versions/*.sql` file in chronological order.
3. Execute the Stage 4 uplift SQL (below) to align the tables with live endpoint expectations.
4. Confirm `select * from pl_site.schema_version;` reports the latest version stamp.
5. Commit any follow-up edits and update this folder when procedures change.

### Stage 4 schema uplift (manual runbook)

Run the block below once per environment after the dated versions finish. It reshapes the pre-release tables to match the interactive API requirements. Adjust placeholder values (`legacy-*`) after backfilling real hashes.

```sql
begin;

-- Comments table reshape
alter table pl_site.comments rename column post_slug to slug;
alter table pl_site.comments rename column name to author_name;
alter table pl_site.comments rename column email to author_email;
alter table pl_site.comments rename column body to content;

alter table pl_site.comments add column if not exists status text not null default 'pending';
alter table pl_site.comments add column if not exists ip_hash text;
alter table pl_site.comments add column if not exists user_agent text;
alter table pl_site.comments add column if not exists is_spam boolean not null default false;
alter table pl_site.comments add column if not exists updated_at timestamptz not null default now();
alter table pl_site.comments add column if not exists moderated_at timestamptz;

update pl_site.comments
set status = case when approved then 'approved' else 'pending' end,
    moderated_at = case when approved then now() else null end
where status is null or status not in ('pending','approved','rejected','spam');

update pl_site.comments set ip_hash = coalesce(ip_hash, 'legacy-missing');

alter table pl_site.comments alter column ip_hash set not null;
alter table pl_site.comments drop column if exists approved;
alter table pl_site.comments add constraint comments_status_valid
  check (status in ('pending','approved','rejected','spam'));

create index if not exists ix_comments_slug_created_at on pl_site.comments (slug, created_at asc);
create index if not exists ix_comments_status_created_at on pl_site.comments (status, created_at desc);

-- Comment counters
create table if not exists pl_site.post_comment_counts (
  slug text primary key,
  approved_count integer not null default 0,
  last_approved_at timestamptz null,
  updated_at timestamptz not null default now()
);

create or replace function pl_site.sync_post_comment_counts() returns trigger as $$
declare
  target_slug text := coalesce(new.slug, old.slug);
  approved_count integer;
  latest timestamptz;
begin
  if tg_op in ('INSERT', 'UPDATE', 'DELETE') then
    select count(*)::int, max(created_at)
    into approved_count, latest
    from pl_site.comments
    where slug = target_slug
      and status = 'approved'
      and is_spam = false;

    if approved_count > 0 then
      insert into pl_site.post_comment_counts (slug, approved_count, last_approved_at, updated_at)
      values (target_slug, approved_count, latest, now())
      on conflict (slug) do update
        set approved_count = excluded.approved_count,
            last_approved_at = excluded.last_approved_at,
            updated_at = excluded.updated_at;
    else
      delete from pl_site.post_comment_counts where slug = target_slug;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists comments_sync_counts on pl_site.comments;
create trigger comments_sync_counts
  after insert or update or delete on pl_site.comments
  for each row execute function pl_site.sync_post_comment_counts();

create or replace function pl_site.set_timestamp_updated() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists comments_set_updated_at on pl_site.comments;
create trigger comments_set_updated_at
  before update on pl_site.comments
  for each row execute function pl_site.set_timestamp_updated();

-- Contact table reshape
alter table pl_site.contact_messages rename column body to message;
alter table pl_site.contact_messages drop column if exists subject;
alter table pl_site.contact_messages add column if not exists status text not null default 'new';
alter table pl_site.contact_messages add column if not exists ip_hash text;
alter table pl_site.contact_messages add column if not exists user_agent text;
alter table pl_site.contact_messages add column if not exists updated_at timestamptz not null default now();
alter table pl_site.contact_messages add column if not exists acknowledged_at timestamptz;

update pl_site.contact_messages
set status = case when handled then 'acknowledged' else 'new' end,
    acknowledged_at = case when handled then now() else acknowledged_at end
where status is null or status not in ('new','acknowledged','archived','spam');

update pl_site.contact_messages set ip_hash = coalesce(ip_hash, 'legacy-missing');

alter table pl_site.contact_messages alter column ip_hash set not null;
alter table pl_site.contact_messages drop column if exists handled;
alter table pl_site.contact_messages add constraint contact_messages_status_valid
  check (status in ('new','acknowledged','archived','spam'));

create index if not exists ix_contact_messages_status_created_at
  on pl_site.contact_messages (status, created_at desc);

drop trigger if exists contact_messages_set_updated_at on pl_site.contact_messages;
create trigger contact_messages_set_updated_at
  before update on pl_site.contact_messages
  for each row execute function pl_site.set_timestamp_updated();

create or replace function pl_site.set_acknowledged_at() returns trigger as $$
begin
  if (new.status <> 'new') and (old.status = 'new' or old.status is null) and new.acknowledged_at is null then
    new.acknowledged_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists contact_messages_set_acknowledged_at on pl_site.contact_messages;
create trigger contact_messages_set_acknowledged_at
  before update on pl_site.contact_messages
  for each row execute function pl_site.set_acknowledged_at();

-- Refresh public read policy to match the new status fields
drop policy if exists allow_public_reads on pl_site.comments;
create policy allow_public_reads
on pl_site.comments
for select
to anon, authenticated
using (status = 'approved' and is_spam = false);

-- Public projection for approved comments
create or replace view public.comments as
select
  id,
  slug,
  author_name as author,
  content,
  created_at
from pl_site.comments
where status = 'approved' and is_spam = false;

grant select on public.comments to anon, authenticated;

commit;
```

## Smoke Test

Run this workflow after configuring credentials (see [`../09-database-and-services.md`](../09-database-and-services.md)) to confirm Supabase, policies, and the application agree on comment handling:

1. Ensure your `.env.local` matches [`../../.env.example`](../../.env.example) and restart `npm run dev` so the service role key is available to the moderation endpoint.
2. In the Supabase SQL editor, insert a comment draft:
   ```sql
   insert into pl_site.comments (slug, author_name, author_email, content, ip_hash)
   values ('getting-started', 'Test Reader', 'reader@example.com', 'Smoke test comment', 'legacy-manual-test');
   ```
3. Approve the draft by setting `status = 'approved'` in the SQL editor (replace the `id` with the value returned from the insert):
   ```sql
   update pl_site.comments
   set status = 'approved', moderated_at = now()
   where id = '00000000-0000-0000-0000-000000000000';
   ```
4. Visit `http://localhost:3000/posts/getting-started` in your running dev server. The comment should render under the post once approved (and will also increment `pl_site.post_comment_counts`). If it does not, compare the active RLS configuration in Supabase with [policies.md](./policies.md) to ensure the read policy allows approved comments to surface.

## Rollback and Recovery

- Restore from Supabase backups when possible.
- Optionally store full exports under [docs/db/snapshots/](./snapshots/) for offline recovery.

## One-Operator Rule

Only Paula applies database changes.

## Execution Log

- 2025-10-14: `2025-10-14t1800--init.sql` applied successfully in Supabase (Paula). `schema_version` = `2025-10-14T1800`.
- 2025-10-21: `2025-10-14t1830--rls-policies.sql` applied via Supabase SQL editor (gpt-5-codex). `schema_version` confirmed at `2025-10-14T1830` using `select version from pl_site.schema_version;`.
- 2025-10-21: Verified `pl_site` policies with `select schemaname, tablename, policyname, permissive, roles from pg_policies where schemaname = 'pl_site';`. Output captured in [verification/2025-10-15--rls-policies-check.md](./verification/2025-10-15--rls-policies-check.md).
