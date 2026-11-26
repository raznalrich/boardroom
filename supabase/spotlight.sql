-- =====================================================================
-- BoardRoom: home page top slideshow ("Leader in the spotlight")
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
-- Managed in Admin -> Spotlight. Each slide has a name, position, short summary and a photo.
-- Until at least one active slide exists, the home page shows its built-in sample slides.
-- =====================================================================

create table if not exists public.spotlight_leaders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  role        text not null check (char_length(role) between 2 and 160),
  summary     text not null default '' check (char_length(summary) <= 600),
  image_url   text,                                   -- public R2 URL
  image_key   text,                                   -- R2 object key
  sort_order  int  not null default 0,                -- lowest number first
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists spotlight_leaders_order_idx on public.spotlight_leaders (sort_order, created_at);

drop trigger if exists spotlight_leaders_updated on public.spotlight_leaders;
create trigger spotlight_leaders_updated before update on public.spotlight_leaders
  for each row execute function public.set_updated_at();

alter table public.spotlight_leaders enable row level security;

drop policy if exists "spotlight public read" on public.spotlight_leaders;
create policy "spotlight public read" on public.spotlight_leaders for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "spotlight admin write" on public.spotlight_leaders;
create policy "spotlight admin write" on public.spotlight_leaders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- DEV ONLY: the admin console signs in with fixed credentials, so the database sees it as the public role.
-- Remove with supabase/dev-lock-down.sql before real visitors use the site.
drop policy if exists "dev open write" on public.spotlight_leaders;
create policy "dev open write" on public.spotlight_leaders for all to anon, authenticated using (true) with check (true);
drop policy if exists "dev open read" on public.spotlight_leaders;
create policy "dev open read" on public.spotlight_leaders for select to anon, authenticated using (true);
