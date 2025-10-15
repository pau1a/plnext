_Last updated: 2025-10-19 by PL_

# DB Operations (Single Operator, No Migrations)

Authoritative SQL change files live in [docs/db/versions/](./versions/).

Schema spec: [schema.md](./schema.md) • Policies: [policies.md](./policies.md) • Versions: [versions/](./versions/) • Snapshots: [snapshots/](./snapshots/)

## Change Application (Manual)

1. Open the Supabase SQL editor for the PaulaLivingstone project.
2. Run each newer `versions/*.sql` file in chronological order.
3. Confirm `select * from pl_site.schema_version;` reports the latest version stamp.
4. Commit any follow-up edits and update this folder when procedures change.

## Rollback and Recovery

- Restore from Supabase backups when possible.
- Optionally store full exports under [docs/db/snapshots/](./snapshots/) for offline recovery.

## One-Operator Rule

Only Paula applies database changes.

## Execution Log

- 2025-10-14: `2025-10-14T1800--init.sql` applied successfully in Supabase (Paula). `schema_version` = 2025-10-14T1800.
- 2025-10-14: Attempted `2025-10-14T1830--rls-policies.sql`, but Supabase credentials were unavailable in this environment. Verification query was not executed (Paula).
- 2025-10-19: Attempted to confirm `ix_comments_post_slug_created_at` and `ix_contact_messages_created_at`, but the Supabase SQL console was inaccessible from this environment. Verification deferred (Paula).
