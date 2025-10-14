# DB Operations (Single Operator, No Migrations)

Authoritative SQL change files live in `docs/db/versions/`.

## Change Application (Manual)

1. Open the Supabase SQL editor for the PaulaLivingstone project.
2. Run each newer `versions/*.sql` file in chronological order.
3. Confirm `select * from pl_site.schema_version;` reports the latest version stamp.
4. Commit any follow-up edits and update this folder when procedures change.

## Rollback and Recovery

- Restore from Supabase backups when possible.
- Optionally store full exports under `docs/db/snapshots/` for offline recovery.

## One-Operator Rule

Only Paula applies database changes.
