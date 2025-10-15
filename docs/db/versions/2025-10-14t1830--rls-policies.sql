begin;

/* COMMENTS */
alter table pl_site.comments enable row level security;

drop policy if exists allow_service_writes on pl_site.comments;
create policy allow_service_writes
on pl_site.comments
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists allow_public_reads on pl_site.comments;
create policy allow_public_reads
on pl_site.comments
for select
to anon, authenticated
using (approved = true);

/* CONTACT_MESSAGES */
alter table pl_site.contact_messages enable row level security;

drop policy if exists allow_service_writes on pl_site.contact_messages;
create policy allow_service_writes
on pl_site.contact_messages
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists block_public_reads on pl_site.contact_messages;
create policy block_public_reads
on pl_site.contact_messages
for select
to anon, authenticated
using (false);

update pl_site.schema_version set version = '2025-10-14T1830' where id = 1;

commit;

