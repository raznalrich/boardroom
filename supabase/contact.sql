-- =====================================================================
-- BoardRoom: Contact Us form
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
-- Anyone can SEND a message; only admins can read them (same rule as subscribers and membership applications).
-- =====================================================================

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text not null check (char_length(subject) between 3 and 150),
  message     text not null check (char_length(message) between 10 and 3000),
  status      text not null default 'new' check (status in ('new','read','replied')),
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages public insert" on public.contact_messages;
create policy "contact_messages public insert" on public.contact_messages
  for insert to anon, authenticated with check (true);

drop policy if exists "contact_messages admin all" on public.contact_messages;
create policy "contact_messages admin all" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
