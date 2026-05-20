-- Remove legacy duplicate policies that were superseded by the portfolio sync migrations.

drop policy if exists "public read projects" on public.projects;
