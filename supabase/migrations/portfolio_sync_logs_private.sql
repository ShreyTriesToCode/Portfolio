-- Keep detailed sync logs server-only. The frontend reads sanitized status
-- through /api/sync-status instead of querying this table directly.

revoke select, insert, update, delete, truncate, references, trigger
on public.github_project_sync_logs
from anon, authenticated;

drop policy if exists "Public can read sync logs" on public.github_project_sync_logs;
