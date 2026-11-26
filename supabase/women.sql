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


-- ---------- Short summary (bio) shown on each woman's profile page -------
alter table public.women_profiles add column if not exists bio text not null default '' check (char_length(bio) <= 1200);

-- Sample summaries for the starter profiles (only fills in empty ones, so your own edits are never overwritten)
update public.women_profiles w set bio = v.bio
from (values
  ('Aisha Al-Falasi', 'Aisha leads Gulf Renewables, one of the region''s fastest-growing clean-energy groups. Under her leadership the company has tripled its capacity in five years while building one of the industry''s most diverse leadership teams. She mentors young engineers and sits on two national sustainability councils.'),
  ('Meera Kapoor', 'Meera took over her family''s logistics business and turned it into a multi-country operation with a reputation for reliability. She is known for investing in people first, from driver training programmes to a fast-track path for women into operations management.'),
  ('Noor Al-Thani', 'Noor oversees finance, risk and investor relations at Doha Capital. A former auditor, she is respected for plain-spoken reporting and disciplined capital allocation, and she chairs an initiative that teaches financial literacy to women entrepreneurs.'),
  ('Priya Raghavan', 'Priya founded HealthBridge after seeing how hard it was for families to reach specialist care. The platform now connects patients and clinics across three countries. She speaks widely on building technology that is trusted with sensitive health data.'),
  ('Dr. Hana Mansour', 'Dr. Mansour is Chief Medical Officer at Horizon Health, where she leads clinical quality across a network of hospitals. A practising physician for twenty years, she champions patient-safety standards and the training of the next generation of clinical leaders.'),
  ('Sofia Almeida', 'Sofia shapes the long-term direction of Meridian Global, from market entry to partnerships. Her approach is to decide clearly what the company will not do, then execute the rest with focus. She is a frequent speaker on strategy in emerging markets.'),
  ('Fatima Zahra', 'Fatima chairs the Najd Education Trust, which funds scholarships and school-leadership programmes. She believes that educating a woman strengthens a whole community, and has helped thousands of girls complete their studies.'),
  ('Ananya Rao', 'Ananya is Chief Technology Officer at NeuraGulf, where she leads work on applied AI for energy and finance. She is a vocal advocate for responsible AI and runs an engineering fellowship that has placed more than a hundred women in technical roles.')
) as v(name, bio)
where w.name = v.name and w.bio = '';
