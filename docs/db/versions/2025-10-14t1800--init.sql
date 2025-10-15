begin;

create schema if not exists pl_site;

create table if not exists pl_site.schema_version (
  id int primary key default 1,
  version text not null
);

insert into pl_site.schema_version (id, version)
values (1, '2025-10-14T1800')
on conflict (id) do update set version = excluded.version;

create extension if not exists pgcrypto;

create table if not exists pl_site.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  name text not null,
  email text,
  body text not null,
  created_at timestamptz not null default now(),
  approved boolean not null default false
);

create index if not exists ix_comments_post_slug_created_at
  on pl_site.comments (post_slug, created_at desc);

create table if not exists pl_site.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  body text not null,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

create index if not exists ix_contact_messages_created_at
  on pl_site.contact_messages (created_at desc);

alter table pl_site.comments enable row level security;
alter table pl_site.contact_messages enable row level security;

commit;
