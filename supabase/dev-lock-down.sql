-- Removes the development policies created by dev-open-access.sql (admin-only writes apply again).
do $$
declare t text;
begin
  foreach t in array array['articles','insights','leader_profiles','events','magazines','banners'] loop
    execute format('drop policy if exists "dev open write" on public.%I', t);
  end loop;
end $$;

-- Also remove the read access granted by admin-read-leads.sql (sign-ups and membership applications private again)
do $$
declare t text;
begin
  foreach t in array array['subscribers','membership_applications'] loop
    execute format('drop policy if exists "dev open read" on public.%I', t);
  end loop;
end $$;
