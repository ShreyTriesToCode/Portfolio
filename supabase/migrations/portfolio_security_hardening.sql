-- Tighten public grants while keeping the portfolio readable and the contact form usable.
-- RLS policies remain the main access control; these grants reduce accidental table exposure.

revoke insert, update, delete, truncate, references, trigger
on public.projects
from anon, authenticated;

revoke insert, update, delete, truncate, references, trigger
on public.certifications
from anon, authenticated;

revoke select, insert, update, delete, truncate, references, trigger
on public.github_project_sync_logs
from anon, authenticated;

grant select
on public.projects, public.certifications
to anon, authenticated;

do $$
begin
  if to_regclass('public.profile') is not null then
    revoke insert, update, delete, truncate, references, trigger
    on public.profile
    from anon, authenticated;

    grant select
    on public.profile
    to anon, authenticated;
  end if;

  if to_regclass('public.contact_messages') is not null then
    revoke select, update, delete, truncate, references, trigger
    on public.contact_messages
    from anon, authenticated;

    grant insert
    on public.contact_messages
    to anon, authenticated;

    drop policy if exists "public insert contact" on public.contact_messages;
    drop policy if exists "public insert contact_messages" on public.contact_messages;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'contact_messages'
        and policyname = 'Public can submit contact messages'
    ) then
      create policy "Public can submit contact messages"
      on public.contact_messages
      for insert
      to anon, authenticated
      with check (
        char_length(btrim(coalesce(name, ''))) between 2 and 80
        and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        and char_length(btrim(coalesce(message, ''))) between 10 and 2000
      );
    end if;
  end if;
end $$;
