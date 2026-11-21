-- =====================================================================
-- BoardRoom: Supabase schema
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Images and PDFs live in Cloudflare R2; these tables store their URL + object key.
-- =====================================================================

-- ---------- helpers ---------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- admins ----------------------------------------------------
-- Admin = a Supabase Auth user whose id is listed here.
-- Create the user in Dashboard -> Authentication -> Users, then run the INSERT at the bottom.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;   -- no policies: not readable via the API

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- articles (admin "Articles" + sector deep dives) -----------

create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 5 and 200),
  category    text not null check (category in
                ('LEADERSHIP','STRATEGY','AI & TECH','GCC MARKETS','FINANCE','HEALTHCARE','EDUCATION','REAL ESTATE','RETAIL')),
  author      text not null,
  summary     text not null default '',
  content     text not null default '',
  read_mins   int  not null default 5 check (read_mins between 1 and 120),
  image_url   text,                                   -- public R2 URL
  image_key   text,                                   -- R2 object key (for deletes)
  status      text not null default 'published' check (status in ('published','draft')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists articles_category_idx on public.articles (category, created_at desc);
create trigger articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

-- ---------- insights --------------------------------------------------

create table if not exists public.insights (
  id           uuid primary key default gen_random_uuid(),
  category     text not null check (category in ('Economy','Strategy','Technology','Sustainability','Finance')),
  title        text not null check (char_length(title) between 8 and 200),
  summary      text not null check (char_length(summary) >= 20),
  details      text,                                  -- elaborate summary (paragraphs split by a blank line)
  author       text not null,
  read_mins    int  not null default 5 check (read_mins between 1 and 60),
  published_on date not null default current_date,
  image_url    text,
  image_key    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists insights_published_idx on public.insights (published_on desc);
create trigger insights_updated before update on public.insights
  for each row execute function public.set_updated_at();

-- ---------- leader profiles (Leadership & CEO Profiles) ---------------

create table if not exists public.leader_profiles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,                   -- e.g. 'tariq-al-mansoor' (used in /leadership-profiles/:slug)
  name        text not null,
  title       text not null,
  company     text not null,
  region      text not null check (region in ('UAE','Saudi Arabia','India','Global')),
  tenure      text,                                   -- e.g. 'CEO since 2020'
  quote       text not null,
  bio         text,
  image_url   text,
  image_key   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger leader_profiles_updated before update on public.leader_profiles
  for each row execute function public.set_updated_at();

-- ---------- events ----------------------------------------------------

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) >= 5),
  type        text not null check (type in ('Summit','Dinner','Webinar','Keynote')),
  event_date  date not null,
  time_label  text not null,                          -- e.g. '09:00 - 18:00'
  city        text not null,
  seats       text not null default 'Open' check (seats in ('Open','Few seats left','Invitation only','Sold out')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists events_date_idx on public.events (event_date);
create trigger events_updated before update on public.events
  for each row execute function public.set_updated_at();

-- ---------- magazines (PDF stored in R2) ------------------------------

create table if not exists public.magazines (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  issue_label     text,                               -- e.g. 'November 2026'
  description     text,
  cover_image_url text,
  cover_image_key text,
  pdf_url         text not null,
  pdf_key         text not null,
  published_on    date not null default current_date,
  created_at      timestamptz not null default now()
);

-- ---------- subscribers (Get in touch form) ---------------------------

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source      text not null default 'Get in touch',
  created_at  timestamptz not null default now()
);
create unique index if not exists subscribers_email_uq on public.subscribers (lower(email));   -- duplicate => error code 23505

-- ---------- membership applications (Network pop-up) ------------------

create table if not exists public.membership_applications (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  phone       text not null check (phone ~ '^\+?[0-9\s\-()]{7,18}$'),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status      text not null default 'new' check (status in ('new','contacted','approved','rejected')),
  created_at  timestamptz not null default now()
);

-- ---------- blog submissions from visitors (Submit a blog page) -------

create table if not exists public.blog_submissions (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 2 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  headline    text not null check (char_length(headline) between 8 and 140),
  category    text not null,
  content     text not null check (char_length(content) >= 100),
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security
-- =====================================================================

-- Public content: anyone can read, only admins can write
do $$
declare t text;
begin
  foreach t in array array['insights','leader_profiles','events','magazines'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s public read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('create policy "%1$s admin write" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Articles: public sees published only; admins see and manage everything
alter table public.articles enable row level security;
create policy "articles public read"  on public.articles for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy "articles admin write"  on public.articles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Visitor forms: anyone may INSERT, nobody but admins may read/change/delete
do $$
declare t text;
begin
  foreach t in array array['subscribers','membership_applications','blog_submissions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s public insert" on public.%1$I for insert to anon, authenticated with check (true)', t);
    execute format('create policy "%1$s admin all" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- =====================================================================
-- After running this script
-- 1) Create your admin login: Dashboard -> Authentication -> Users -> Add user (email + password)
-- 2) Copy that user's UUID and run:
--      insert into public.admins (user_id) values ('PASTE-USER-UUID-HERE');
-- =====================================================================
