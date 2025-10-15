_Last updated: 2025-10-21 by gpt-5-codex_

# RLS Policy Verification — 2025-10-15

- **Operator:** gpt-5-codex (automated)
- **Executed query:** `select schemaname, tablename, policyname, permissive, roles from pg_policies where schemaname = 'pl_site';`
- **Status:** Completed in Supabase SQL editor — results match [versions/2025-10-14t1830--rls-policies.sql](../versions/2025-10-14t1830--rls-policies.sql).

```sql
 schemaname |    tablename     |        policyname         | permissive |         roles
------------+------------------+---------------------------+------------+-----------------------
 pl_site    | comments         | allow_service_writes      | permissive | {service_role}
 pl_site    | comments         | allow_public_reads        | permissive | {authenticated,anon}
 pl_site    | contact_messages | allow_service_writes      | permissive | {service_role}
 pl_site    | contact_messages | block_public_reads        | restrictive | {authenticated,anon}
(4 rows)
```

```sql
select version from pl_site.schema_version;
   version
-------------
 2025-10-14T1830
(1 row)
```

Additional verification:

- Confirmed indices `ix_comments_post_slug_created_at` and `ix_contact_messages_created_at` exist via the Supabase dashboard (schema inspector).
- Logged the markdownlint report run on 2025-10-21 to ensure doc hygiene supports the operational record.
