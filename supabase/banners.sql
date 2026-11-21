-- =====================================================================
-- BoardRoom: home page banner slider ("top articles") table
-- Run in Supabase Dashboard -> SQL Editor. Requires schema.sql to have been run first
-- (it uses public.set_updated_at() and public.is_admin()).
-- =====================================================================

create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  tag         text not null default 'EDITORIAL' check (char_length(tag) between 2 and 30),   -- small label on the slide
  title       text not null check (char_length(title) between 8 and 220),
  author      text not null,
  read_mins   int  not null default 5 check (read_mins between 1 and 60),
  bullets     text[] not null default '{}',                                                   -- short bullet points under the title
  image_url   text,                                                                           -- public R2 URL
  image_key   text,                                                                           -- R2 object key
  sort_order  int  not null default 0,                                                        -- lowest number shows first
  is_active   boolean not null default true,                                                  -- hide a banner without deleting it
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists banners_order_idx on public.banners (sort_order, created_at);

create trigger banners_updated before update on public.banners
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------------------------------------

alter table public.banners enable row level security;

-- Visitors see active banners only; admins see all
drop policy if exists "banners public read" on public.banners;
create policy "banners public read" on public.banners for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "banners admin write" on public.banners;
create policy "banners admin write" on public.banners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- DEVELOPMENT ONLY: the admin screens currently sign in with fixed credentials in the browser, so the database
-- sees them as the public "anon" role. This lets them save banners. Remove it with:
--   drop policy "dev open write" on public.banners;
drop policy if exists "dev open write" on public.banners;
create policy "dev open write" on public.banners for all to anon, authenticated using (true) with check (true);

-- ---------- Starting content (the four slides the site had) -----------
-- Only inserted when the table is empty, so re-running this file is safe.

insert into public.banners (tag, title, author, read_mins, bullets, image_url, sort_order)
select * from (values
  ('EDITORIAL',  'THE BILLION-DOLLAR VISION: How India''s Next-Gen Industrialists Are Rewriting Global Logistics', 'Priya Nair', 7,
     array['Business leaders driving vision in Next-Gen Global Logistics','Summary of key industrialists rewriting global supply chain corridors'],
     'https://i.pinimg.com/1200x/89/b5/1a/89b51abbd6177492d21a1022a2cb67a2.jpg', 1),
  ('MARKETS',    'GULF CAPITAL GOES GLOBAL: Sovereign Funds Reshape the Flow of International Investment', 'Layla Haddad', 9,
     array['State-backed investors now deploy more outbound capital than ever','What it means for regional deal-making in 2027'],
     'https://images.pexels.com/photos/22719284/pexels-photo-22719284.jpeg', 2),
  ('INNOVATION', 'AI IN THE C-SUITE: Three Operating Models That Actually Work', 'Sara Al-Qahtani', 8,
     array['Lessons from 40 regional enterprises','Governance structures behind successful AI rollouts'],
     'https://images.pexels.com/photos/7845285/pexels-photo-7845285.jpeg', 3),
  ('LEADERSHIP', 'THE CHAIRMAN''S PLAYBOOK: Family Governance in the Next Generation of Conglomerates', 'Khalid Nasser', 10,
     array['Succession, transparency and public listing','Advice from the region''s most influential chairs'],
     'https://images.pexels.com/photos/3733584/pexels-photo-3733584.jpeg', 4)
) as seed(tag, title, author, read_mins, bullets, image_url, sort_order)
where not exists (select 1 from public.banners);
