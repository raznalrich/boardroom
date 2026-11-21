-- =====================================================================
-- BoardRoom: editable home page blocks (Admin -> Settings)
--   * THE BOARDROOM ROUNDTABLE  : 3 interview guests
--   * THE POWER LIST (Top 6)    : 6 visionaries
--   * EXECUTIVE INTELLIGENCE REPORT : heading, description and a PDF (stored on Cloudflare R2)
--
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once:
-- the starting content is only inserted while a table is empty.
-- =====================================================================

-- ---------- tables ----------------------------------------------------

create table if not exists public.roundtable_guests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 120),
  role          text not null check (char_length(role) between 2 and 120),
  organisation  text not null default '' check (char_length(organisation) <= 120),
  image_url     text,
  image_key     text,
  sort_order    int  not null default 0,
  updated_at    timestamptz not null default now()
);

create table if not exists public.power_list_people (
  id          uuid primary key default gen_random_uuid(),
  rank        int  not null check (rank between 1 and 99),
  name        text not null check (char_length(name) between 2 and 120),
  headline    text not null default '' check (char_length(headline) <= 160),   -- the line shown under the name
  image_url   text,
  image_key   text,
  updated_at  timestamptz not null default now()
);

-- a single row (id is always 1)
create table if not exists public.intelligence_report (
  id           int primary key default 1 check (id = 1),
  title        text not null check (char_length(title) between 3 and 160),
  description  text not null default '' check (char_length(description) <= 500),
  pdf_url      text,
  pdf_key      text,
  pdf_name     text,
  updated_at   timestamptz not null default now()
);

drop trigger if exists roundtable_guests_updated on public.roundtable_guests;
create trigger roundtable_guests_updated before update on public.roundtable_guests for each row execute function public.set_updated_at();
drop trigger if exists power_list_people_updated on public.power_list_people;
create trigger power_list_people_updated before update on public.power_list_people for each row execute function public.set_updated_at();
drop trigger if exists intelligence_report_updated on public.intelligence_report;
create trigger intelligence_report_updated before update on public.intelligence_report for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------------------------------------
-- Everyone can read; admins can write.
-- The "dev open write" policy is DEVELOPMENT ONLY (the admin screens currently sign in with fixed credentials in
-- the browser, so the database sees them as the public "anon" role). Remove it before launch with:
--   drop policy "dev open write" on public.<table>;

do $$
declare t text;
begin
  foreach t in array array['roundtable_guests','power_list_people','intelligence_report'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%1$s public read" on public.%1$I', t);
    execute format('create policy "%1$s public read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "%1$s admin write" on public.%1$I', t);
    execute format('create policy "%1$s admin write" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "dev open write" on public.%I', t);
    execute format('create policy "dev open write" on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- starting content (what the home page showed before) -------

insert into public.roundtable_guests (name, role, organisation, image_url, sort_order)
select * from (values
  ('Tariq Al-Mansoor', 'Regional CEO',       'Gulf Investments',          'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop', 1),
  ('Sunita Sharma',    'Managing Director',  'Apex Logistics India',      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', 2),
  ('Zaid Al-Hassan',   'Chief Strategy Officer', 'Middle East Tech Ventures', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop', 3)
) as v(name, role, organisation, image_url, sort_order)
where not exists (select 1 from public.roundtable_guests);

insert into public.power_list_people (rank, name, headline, image_url)
select * from (values
  (1, 'Vikramaditya Singh', 'Regional Leader',          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'),
  (2, 'Siddharth Mehta',    'Business Leader',          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'),
  (3, 'Nasser Al-Kharafi',  'Astute CEO',               'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80'),
  (4, 'Ramesh Iyer',        'Chief Executive',          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'),
  (5, 'Omar Al-Futtaim',    'Enterprise Transformation','https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'),
  (6, 'Karan Adani',        'Industry Leader',          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80')
) as v(rank, name, headline, image_url)
where not exists (select 1 from public.power_list_people);

insert into public.intelligence_report (id, title, description)
select 1, 'The 2027 C-Suite Agenda Report',
       'Comprehensive deep-dives into regional market shifts, M&A activity, and strategic foresight for 2027.'
where not exists (select 1 from public.intelligence_report);

-- ---------- tell an open dashboard when these change (only if dashboard.sql has been run) ----------

do $$
declare t text;
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'notify_dashboard') then
    foreach t in array array['roundtable_guests','power_list_people','intelligence_report'] loop
      execute format('drop trigger if exists dashboard_notify on public.%I', t);
      execute format('create trigger dashboard_notify after insert or update or delete on public.%I for each statement execute function public.notify_dashboard()', t);
    end loop;
  end if;
end $$;
