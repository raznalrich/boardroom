-- =====================================================================
-- BoardRoom: membership approval (admin "Membership" tab) + magazine download check
-- Run in Supabase Dashboard -> SQL Editor. Safe to run more than once.
--
-- 1. adds the column  membership_applications.is_member  (true once an admin approves the application)
-- 2. keeps is_member in step with status (approved => true, anything else => false)
-- 3. check_member(email)  : lets the public magazine page ask "is this email an approved member?" without
--                           being able to read the table itself
-- 4. lets the admin console read and update applications (dev access, same caveat as admin-read-leads.sql:
--    remove with dev-lock-down.sql and move the admin to real Supabase sign-in before real visitors use the site)
-- =====================================================================

alter table public.membership_applications add column if not exists is_member boolean not null default false;
update public.membership_applications set is_member = (status = 'approved');

create or replace function public.sync_is_member() returns trigger language plpgsql as $$
begin
  new.is_member := (new.status = 'approved');
  return new;
end $$;

drop trigger if exists membership_sync_is_member on public.membership_applications;
create trigger membership_sync_is_member before insert or update of status on public.membership_applications
  for each row execute function public.sync_is_member();

create or replace function public.check_member(p_email text) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.membership_applications
    where lower(email) = lower(trim(p_email)) and is_member
  );
$$;
revoke all on function public.check_member(text) from public;
grant execute on function public.check_member(text) to anon, authenticated;

drop policy if exists "dev open read" on public.membership_applications;
create policy "dev open read" on public.membership_applications for select to anon, authenticated using (true);
drop policy if exists "dev open update" on public.membership_applications;
create policy "dev open update" on public.membership_applications for update to anon, authenticated using (true) with check (true);
