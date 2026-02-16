-- Projects migration for Supabase
-- Purpose:
-- 1) Optionally move existing events rows into projects rows
-- 2) Remove old events table
-- 3) Create projects table for admin-managed landing/projects cards
-- 4) Add indexes + trigger + RLS policies

begin;

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- Optional: preserve existing event content as starter project rows.
-- Comment this block out if you do NOT want any carry-over data.
create table if not exists public.projects_backup_from_events as
select
  coalesce(id, gen_random_uuid()) as id,
  title,
  description,
  event_type as tag,
  '/active-projects'::text as href,
  row_number() over (order by created_at asc nulls last, title asc) - 1 as display_order,
  true as is_published,
  coalesce(created_at, now()) as created_at,
  coalesce(updated_at, now()) as updated_at,
  created_by_clerk
from public.events
where title is not null
  and description is not null;

-- Remove old events table completely.
drop table if exists public.events cascade;

-- New projects table.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  tag text,
  href text,
  display_order integer,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_clerk text
);

-- Optional: move backup rows into the new projects table.
insert into public.projects (
  id,
  title,
  description,
  tag,
  href,
  display_order,
  is_published,
  created_at,
  updated_at,
  created_by_clerk
)
select
  b.id,
  b.title,
  b.description,
  b.tag,
  b.href,
  b.display_order,
  b.is_published,
  b.created_at,
  b.updated_at,
  b.created_by_clerk
from public.projects_backup_from_events b
on conflict (id) do nothing;

-- Keep updated_at current on updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create index if not exists idx_projects_display_order on public.projects (display_order);
create index if not exists idx_projects_published_order on public.projects (is_published, display_order);

-- RLS setup
alter table public.projects enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Authenticated can read all projects" on public.projects;
create policy "Authenticated can read all projects"
on public.projects
for select
to authenticated
using (true);

-- No direct client-side writes; admin writes happen through server route with service role key.

commit;
