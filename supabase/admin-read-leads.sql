-- =====================================================================
-- BoardRoom: let the admin "Subscribers" tab read sign-ups and membership applications
-- Run in Supabase Dashboard -> SQL Editor. Safe to run more than once.
--
-- !! READ THIS FIRST !!
-- The admin area currently signs in with fixed credentials inside the website, so the database sees every admin
-- request as the public "anon" role. To let that tab read these two tables, this script allows the public role to
-- READ them. That means ANYONE who has the site's public key (it is visible in the browser) could read the names,
-- emails and phone numbers people submitted.
--
-- That is acceptable while building and testing with fake data. Before real visitors use the site:
--   1. run supabase/dev-lock-down.sql (removes this access), and
--   2. switch the admin to real Supabase sign-in, so only admins can read these tables.
--      (Ask for this; it can reuse the same email and password.)
-- =====================================================================

do $$
declare t text;
begin
  foreach t in array array['subscribers','membership_applications'] loop
    execute format('drop policy if exists "dev open read" on public.%I', t);
    execute format('create policy "dev open read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;
