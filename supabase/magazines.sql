-- =====================================================================
-- BoardRoom: E-Magazine upload support
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
-- The `magazines` table already exists (schema.sql): title, cover image, PDF, published date.
-- This adds the on/off switch so a magazine can be hidden without deleting it.
-- The files themselves (cover image + PDF) live in Cloudflare R2; the table stores their URLs.
-- =====================================================================

alter table public.magazines add column if not exists is_active boolean not null default true;

create index if not exists magazines_published_idx on public.magazines (published_on desc, created_at desc);

-- Visitors see enabled magazines only; admins see all.
drop policy if exists "magazines public read" on public.magazines;
create policy "magazines public read" on public.magazines for select to anon, authenticated
  using (is_active or public.is_admin());

-- DEVELOPMENT ONLY: the admin screens currently sign in with fixed credentials in the browser, so the database
-- sees them as the public "anon" role. This lets them save magazines. Remove it with:
--   drop policy "dev open write" on public.magazines;
drop policy if exists "dev open write" on public.magazines;
create policy "dev open write" on public.magazines for all to anon, authenticated using (true) with check (true);

-- Also tell an open dashboard when magazines change (only if dashboard.sql has been run)
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'notify_dashboard') then
    drop trigger if exists dashboard_notify on public.magazines;
    create trigger dashboard_notify after insert or update or delete on public.magazines
      for each statement execute function public.notify_dashboard();
  end if;
end $$;


-- ---------- Regions (America, Africa, Europe, Middle East, Asia) -------
alter table public.magazines add column if not exists region text not null default 'Middle East';
alter table public.magazines drop constraint if exists magazines_region_check;
alter table public.magazines add constraint magazines_region_check check (region in ('America','Africa','Europe','Middle East','Asia'));
