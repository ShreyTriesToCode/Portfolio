create extension if not exists pgcrypto;

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  credential_id text,
  credential_url text,
  description text,
  skills text[] default '{}',
  issued_at text,
  expires_at text,
  featured boolean default false,
  priority integer default 99,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.certifications add column if not exists title text;
alter table public.certifications add column if not exists issuer text;
alter table public.certifications add column if not exists credential_id text;
alter table public.certifications add column if not exists credential_url text;
alter table public.certifications add column if not exists description text;
alter table public.certifications add column if not exists skills text[] default '{}';
alter table public.certifications add column if not exists issued_at text;
alter table public.certifications add column if not exists expires_at text;
alter table public.certifications add column if not exists featured boolean default false;
alter table public.certifications add column if not exists priority integer default 99;
alter table public.certifications add column if not exists created_at timestamptz default now();
alter table public.certifications add column if not exists updated_at timestamptz default now();

alter table public.certifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'certifications' and policyname = 'Public can read certifications'
  ) then
    create policy "Public can read certifications"
    on public.certifications
    for select
    using (true);
  end if;
end $$;

create index if not exists certifications_priority_idx on public.certifications (featured desc, priority asc, issued_at desc);
