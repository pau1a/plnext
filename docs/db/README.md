_Last updated: 2025-10-14 by PL_

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
