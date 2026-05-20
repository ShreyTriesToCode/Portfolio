-- Keep RLS explicit for sync logs without exposing rows to browser clients.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'github_project_sync_logs'
      and policyname = 'Sync logs are server only'
  ) then
    create policy "Sync logs are server only"
    on public.github_project_sync_logs
    for select
    to anon, authenticated
    using (false);
  end if;
end $$;
