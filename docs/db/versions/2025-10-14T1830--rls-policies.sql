begin;

/* COMMENTS: public can read approved only; no public writes. Service role bypasses RLS. */
drop policy if exists "Read approved comments" on pl_site.comments;

create policy "Read approved comments"
on pl_site.comments
for select
to public
using (approved = true);

/* CONTACT_MESSAGES: no public read. (No select policy means default deny.) */
/* No insert/update/delete policies added — default deny for public/authenticated. Service role bypasses RLS. */

update pl_site.schema_version set version = '2025-10-14T1830' where id = 1;

commit;

