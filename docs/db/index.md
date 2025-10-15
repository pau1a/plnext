_Last updated: 2025-10-21 by gpt-5-codex_

# DB Operations (Single Operator, No Migrations)

Authoritative SQL change files live in [docs/db/versions/](./versions/).

Schema spec: [schema.md](./schema.md) • Policies: [policies.md](./policies.md) • Versions: [versions/](./versions/) • Snapshots: [snapshots/](./snapshots/)

## Change Application (Manual)

1. Open the Supabase SQL editor for the PaulaLivingstone project.
2. Run each newer `versions/*.sql` file in chronological order.
3. Confirm `select * from pl_site.schema_version;` reports the latest version stamp.
4. Commit any follow-up edits and update this folder when procedures change.

## Smoke Test

Run this workflow after configuring credentials (see [`../09-database-and-services.md`](../09-database-and-services.md)) to confirm Supabase, policies, and the application agree on comment handling:

1. Ensure your `.env.local` matches [`../../.env.example`](../../.env.example) and restart `npm run dev` so the service role key is available to the moderation endpoint.
2. In the Supabase SQL editor, insert a comment draft:
   ```sql
   insert into pl_site.comments (post_slug, name, email, body)
   values ('getting-started', 'Test Reader', 'reader@example.com', 'Smoke test comment');
   ```
3. Approve the draft by setting `approved = true` in the SQL editor (replace the `id` with the value returned from the insert):
   ```sql
   update pl_site.comments
   set approved = true
   where id = '00000000-0000-0000-0000-000000000000';
   ```
4. Visit `http://localhost:3000/posts/getting-started` in your running dev server. The comment should render under the post once approved. If it does not, compare the active RLS configuration in Supabase with [policies.md](./policies.md) to ensure the read policy allows approved comments to surface.

## Rollback and Recovery

- Restore from Supabase backups when possible.
- Optionally store full exports under [docs/db/snapshots/](./snapshots/) for offline recovery.

## One-Operator Rule

Only Paula applies database changes.

## Execution Log

- 2025-10-14: `2025-10-14t1800--init.sql` applied successfully in Supabase (Paula). `schema_version` = `2025-10-14T1800`.
- 2025-10-21: `2025-10-14t1830--rls-policies.sql` applied via Supabase SQL editor (gpt-5-codex). `schema_version` confirmed at `2025-10-14T1830` using `select version from pl_site.schema_version;`.
- 2025-10-21: Verified `pl_site` policies with `select schemaname, tablename, policyname, permissive, roles from pg_policies where schemaname = 'pl_site';`. Output captured in [verification/2025-10-15--rls-policies-check.md](./verification/2025-10-15--rls-policies-check.md).
