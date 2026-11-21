-- =====================================================================
-- BoardRoom: real visitor tracking + live admin dashboard
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
-- How it works
--  * The website records one row in public.page_views for every page a visitor opens.
--    visitor_id is a random id kept in the visitor's browser (no names, emails or IP addresses are stored).
--  * The raw rows are NOT readable by the public. The dashboard asks the function dashboard_stats(),
--    which returns only totals (visitors, views, subscribers, daily chart, top sections).
--  * Any change to visits, subscribers, articles, insights, events or profiles sends a small
--    "something changed" broadcast on the channel "dashboard", so an open dashboard refreshes instantly.
-- =====================================================================

-- ---------- visits ----------------------------------------------------

create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  path        text not null check (char_length(path) <= 300),
  visitor_id  text not null check (char_length(visitor_id) between 8 and 64),
  session_id  text not null check (char_length(session_id) between 8 and 64),
  referrer    text check (char_length(referrer) <= 300),
  created_at  timestamptz not null default now()
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_idx on public.page_views (visitor_id);

alter table public.page_views enable row level security;

-- Visitors can only ADD a row. Reading raw rows is limited to real Supabase admins.
drop policy if exists "page_views public insert" on public.page_views;
create policy "page_views public insert" on public.page_views for insert to anon, authenticated with check (true);

drop policy if exists "page_views admin read" on public.page_views;
create policy "page_views admin read" on public.page_views for select to authenticated using (public.is_admin());

-- ---------- dashboard numbers -----------------------------------------
-- SECURITY DEFINER lets this one function count rows the public cannot read, and it returns totals only.

create or replace function public.dashboard_stats(p_days int default 7, p_tz text default 'UTC')
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_days  int  := least(greatest(coalesce(p_days, 7), 1), 90);
  v_today date := (now() at time zone p_tz)::date;
  v_from  timestamptz := ((v_today - (v_days - 1))::timestamp) at time zone p_tz;
begin
  return jsonb_build_object(
    'total_visitors', (select count(distinct visitor_id) from page_views),
    'total_views',    (select count(*) from page_views),
    'visitors_today', (select count(distinct visitor_id) from page_views where (created_at at time zone p_tz)::date = v_today),
    'views_today',    (select count(*) from page_views where (created_at at time zone p_tz)::date = v_today),
    'online_now',     (select count(distinct visitor_id) from page_views where created_at > now() - interval '5 minutes'),
    'subscribers',    (select count(*) from subscribers),

    -- one entry per day (zeros included) for the chart
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day', x.d, 'visitors', coalesce(v.visitors, 0), 'views', coalesce(v.views, 0)) order by x.d), '[]'::jsonb)
      from (select (v_today - (v_days - 1 - i))::date as d from generate_series(0, v_days - 1) as i) x
      left join (
        select (created_at at time zone p_tz)::date as day, count(distinct visitor_id) as visitors, count(*) as views
        from page_views where created_at >= v_from group by 1
      ) v on v.day = x.d
    ),

    -- views grouped by the first part of the address: /insights/123 counts as "insights"
    'sections', (
      select coalesce(jsonb_agg(jsonb_build_object('section', s.section, 'views', s.views) order by s.views desc), '[]'::jsonb)
      from (
        select coalesce(nullif(split_part(ltrim(path, '/'), '/', 1), ''), 'home') as section, count(*) as views
        from page_views where created_at >= v_from group by 1 order by 2 desc limit 8
      ) s
    )
  );
end $$;

grant execute on function public.dashboard_stats(int, text) to anon, authenticated;

-- ---------- live updates ----------------------------------------------
-- Sends {"table": "..."} on the public channel "dashboard". It carries no data, only the fact that something changed.
-- It never blocks the original insert/update: any error here is swallowed.

create or replace function public.notify_dashboard()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  begin
    perform realtime.send(jsonb_build_object('table', tg_table_name), 'change', 'dashboard', false);
  exception when others then
    null;
  end;
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['page_views','subscribers','articles','insights','events','leader_profiles','banners'] loop
    execute format('drop trigger if exists dashboard_notify on public.%I', t);
    execute format('create trigger dashboard_notify after insert or update or delete on public.%I for each statement execute function public.notify_dashboard()', t);
  end loop;
end $$;
