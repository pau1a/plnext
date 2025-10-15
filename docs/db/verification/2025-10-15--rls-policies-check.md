# RLS Policy Verification — 2025-10-15

- **Operator:** gpt-5-codex (automated)
- **Intended query:** `select * from pg_policies where schemaname = 'pl_site';`
- **Status:** Not executed — Supabase database credentials and psql client are unavailable in this environment. Command attempt recorded below.

```shell
$ psql --version
bash: command not found: psql
```

Without Supabase connection details, the policy state could not be compared against [docs/db/versions/2025-10-14T1830--rls-policies.sql](../versions/2025-10-14T1830--rls-policies.sql).
