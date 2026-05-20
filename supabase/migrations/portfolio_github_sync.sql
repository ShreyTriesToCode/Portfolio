create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects add column if not exists github_repo_id bigint unique;
alter table public.projects add column if not exists github_owner text not null default 'ShreyTriesToCode';
alter table public.projects add column if not exists github_name text;
alter table public.projects add column if not exists slug text unique;
alter table public.projects add column if not exists title text;
alter table public.projects add column if not exists category text;
alter table public.projects add column if not exists short_description text;
alter table public.projects add column if not exists long_description text;
alter table public.projects add column if not exists readme_summary text;
alter table public.projects add column if not exists tech_stack text[] default '{}';
alter table public.projects add column if not exists tags text[] default '{}';
alter table public.projects add column if not exists repo_url text;
alter table public.projects add column if not exists demo_url text;
alter table public.projects add column if not exists image_url text;
alter table public.projects add column if not exists screenshots text[] default '{}';
alter table public.projects add column if not exists architecture_image text;
alter table public.projects add column if not exists case_study_pdf text;
alter table public.projects add column if not exists featured boolean default false;
alter table public.projects add column if not exists status text default 'Active';
alter table public.projects add column if not exists difficulty text;
alter table public.projects add column if not exists role text;
alter table public.projects add column if not exists priority integer default 99;
alter table public.projects add column if not exists stars integer default 0;
alter table public.projects add column if not exists forks integer default 0;
alter table public.projects add column if not exists open_issues integer default 0;
alter table public.projects add column if not exists language text;
alter table public.projects add column if not exists languages jsonb default '{}'::jsonb;
alter table public.projects add column if not exists started_at text;
alter table public.projects add column if not exists completed_at text;
alter table public.projects add column if not exists last_github_update timestamptz;
alter table public.projects add column if not exists last_commit_at timestamptz;
alter table public.projects add column if not exists synced_at timestamptz default now();

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'description') then
    execute 'update public.projects set short_description = coalesce(short_description, description) where title is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'stack') then
    execute 'update public.projects set tech_stack = coalesce(tech_stack, stack) where title is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'github_url') then
    execute 'update public.projects set repo_url = coalesce(repo_url, github_url) where title is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'live_url') then
    execute 'update public.projects set demo_url = coalesce(demo_url, live_url) where title is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'sort_order') then
    execute 'update public.projects set priority = coalesce(priority, sort_order, 99) where title is not null';
  end if;
end $$;

update public.projects
set slug = coalesce(slug, lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')))
where title is not null;

create table if not exists public.github_project_sync_logs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text,
  repos_scanned integer default 0,
  repos_eligible integer default 0,
  repos_imported integer default 0,
  repos_skipped integer default 0,
  error_message text,
  details jsonb default '{}'::jsonb
);

alter table public.projects enable row level security;
alter table public.github_project_sync_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'projects' and policyname = 'Public can read projects'
  ) then
    create policy "Public can read projects"
    on public.projects
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'github_project_sync_logs' and policyname = 'Public can read sync logs'
  ) then
    create policy "Public can read sync logs"
    on public.github_project_sync_logs
    for select
    using (true);
  end if;
end $$;

create index if not exists projects_featured_priority_idx on public.projects (featured desc, priority asc);
create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists github_project_sync_logs_started_idx on public.github_project_sync_logs (started_at desc);
