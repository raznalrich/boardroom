-- =====================================================================
-- BoardRoom: visitor blog submissions arrive as DRAFT articles
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
-- When a visitor uses the "Submit a blog" page, the submission is saved in blog_submissions (as before).
-- A database trigger then also creates a DRAFT row in public.articles, so it shows up in
-- Admin -> Articles. The admin reviews it, edits it if needed, and publishes it.
--
-- Drafts are invisible to visitors until published. The submitter's email is kept on the draft
-- (submitted_email) so you can contact them, and is never shown on the website.
-- =====================================================================

alter table public.articles add column if not exists source text not null default 'admin';
alter table public.articles add column if not exists submitted_email text;

alter table public.articles drop constraint if exists articles_source_check;
alter table public.articles add constraint articles_source_check check (source in ('admin', 'visitor'));

create or replace function public.blog_submission_to_draft()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_category text := upper(new.category);
begin
  -- fall back to a valid category if the visitor somehow sent something unexpected
  if v_category not in ('LEADERSHIP','STRATEGY','AI & TECH','GCC MARKETS','FINANCE','HEALTHCARE','EDUCATION','REAL ESTATE','RETAIL') then
    v_category := 'LEADERSHIP';
  end if;

  insert into public.articles (title, category, author, summary, content, read_mins, status, source, submitted_email)
  values (
    left(new.headline, 200),
    v_category,
    new.author_name,
    left(regexp_replace(new.content, '\s+', ' ', 'g'), 200),
    new.content,
    least(greatest(ceil(array_length(regexp_split_to_array(btrim(new.content), '\s+'), 1) / 200.0)::int, 1), 120),
    'draft',
    'visitor',
    new.email
  );
  return new;
exception when others then
  -- never lose the submission itself because the draft could not be created
  return new;
end $$;

drop trigger if exists blog_submission_draft on public.blog_submissions;
create trigger blog_submission_draft after insert on public.blog_submissions
  for each row execute function public.blog_submission_to_draft();

-- One-off: turn submissions that arrived before this script into drafts too (skips ones already there)
insert into public.articles (title, category, author, summary, content, read_mins, status, source, submitted_email)
select left(b.headline, 200),
       case when upper(b.category) in ('LEADERSHIP','STRATEGY','AI & TECH','GCC MARKETS','FINANCE','HEALTHCARE','EDUCATION','REAL ESTATE','RETAIL')
            then upper(b.category) else 'LEADERSHIP' end,
       b.author_name,
       left(regexp_replace(b.content, '\s+', ' ', 'g'), 200),
       b.content,
       least(greatest(ceil(array_length(regexp_split_to_array(btrim(b.content), '\s+'), 1) / 200.0)::int, 1), 120),
       'draft', 'visitor', b.email
from public.blog_submissions b
where not exists (select 1 from public.articles a where a.source = 'visitor' and a.title = left(b.headline, 200) and a.author = b.author_name);
