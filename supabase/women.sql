-- =====================================================================
-- BoardRoom: Women Empowerment section (home page)
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
-- The profiles are managed in Admin -> Women. The home page shows five at a time and rotates through all of
-- the active ones with a fade-and-slide transition. The names, roles, quotes and photos seeded below are SAMPLE
-- content for testing: replace them with real people from the admin console.
-- =====================================================================

create table if not exists public.women_profiles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 120),
  role          text not null check (char_length(role) between 2 and 120),
  organisation  text not null default '' check (char_length(organisation) <= 120),
  quote         text not null default '' check (char_length(quote) <= 240),
  image_url     text,                                   -- public R2 URL
  image_key     text,                                   -- R2 object key
  sort_order    int  not null default 0,                -- lowest number first
  is_active     boolean not null default true,          -- hide a profile without deleting it
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists women_profiles_order_idx on public.women_profiles (sort_order, created_at);

drop trigger if exists women_profiles_updated on public.women_profiles;
create trigger women_profiles_updated before update on public.women_profiles
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------------------------------------
alter table public.women_profiles enable row level security;

-- Visitors see active profiles; admins see all
drop policy if exists "women_profiles public read" on public.women_profiles;
create policy "women_profiles public read" on public.women_profiles for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "women_profiles admin write" on public.women_profiles;
create policy "women_profiles admin write" on public.women_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- DEVELOPMENT ONLY: the admin screens currently sign in with fixed credentials in the browser, so the database
-- sees them as the public "anon" role. This lets them save profiles. Remove it with:
--   drop policy "dev open write" on public.women_profiles;
drop policy if exists "dev open write" on public.women_profiles;
create policy "dev open write" on public.women_profiles for all to anon, authenticated using (true) with check (true);

-- ---------- sample content (only inserted while the table is empty) ---

insert into public.women_profiles (name, role, organisation, quote, image_url, sort_order)
select * from (values
  ('Aisha Al-Falasi',  'Group CEO',               'Gulf Renewables',   'Leadership is the courage to open doors for the next woman in line.',          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', 1),
  ('Meera Kapoor',     'Managing Director',       'Kapoor Logistics',  'Great teams are built on trust, and on giving people room to grow.',           'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80', 2),
  ('Noor Al-Thani',    'Chief Financial Officer', 'Doha Capital',      'Numbers tell a story. My job is to make sure it is an honest one.',            'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80', 3),
  ('Priya Raghavan',   'Founder & CEO',           'HealthBridge',      'Innovation is simply empathy at scale.',                                       'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', 4),
  ('Dr. Hana Mansour', 'Chief Medical Officer',   'Horizon Health',    'Care and excellence are not opposites. They are the same standard.',           'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', 5),
  ('Sofia Almeida',    'Chief Strategy Officer',  'Meridian Global',   'Strategy is deciding what you will not do, then doing the rest brilliantly.',  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80', 6),
  ('Fatima Zahra',     'Chair',                   'Najd Education Trust', 'Educating a woman strengthens an entire community.',                       'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', 7),
  ('Ananya Rao',       'Chief Technology Officer','NeuraGulf',         'Build products you would trust with your own family''s data.',                 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 8)
) as v(name, role, organisation, quote, image_url, sort_order)
where not exists (select 1 from public.women_profiles);

-- Tell an open dashboard when profiles change (only if dashboard.sql has been run)
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'notify_dashboard') then
    drop trigger if exists dashboard_notify on public.women_profiles;
    create trigger dashboard_notify after insert or update or delete on public.women_profiles
      for each statement execute function public.notify_dashboard();
  end if;
end $$;
