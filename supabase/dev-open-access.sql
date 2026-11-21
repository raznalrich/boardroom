-- =====================================================================
-- DEVELOPMENT ONLY: lets the admin screens save content without a Supabase login.
-- The admin area now signs in with fixed credentials in the browser, so the database
-- sees every request as the public "anon" role. These policies allow that role to write
-- the CONTENT tables. Anyone who has the (public) anon key can then change this content.
--
-- NOT opened on purpose: subscribers, membership_applications, blog_submissions
-- (they hold visitors' names, emails and phone numbers).
--
-- Undo with supabase/dev-lock-down.sql
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array['articles','insights','leader_profiles','events','magazines','banners'] loop
    execute format('drop policy if exists "dev open write" on public.%I', t);
    execute format('create policy "dev open write" on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;
