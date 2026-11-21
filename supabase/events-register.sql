-- =====================================================================
-- BoardRoom: event registration link + details text
-- Run in Supabase Dashboard -> SQL Editor (after schema.sql). Safe to run more than once.
--
--  register_url : where the "Register now" button in the event pop-up sends the visitor
--                 (a link to your ticketing / form page; must start with http:// or https://)
--  description  : the text shown in the event details pop-up
--
-- Both are optional. Without a register_url the pop-up shows "Registration link coming soon" instead of the button.
-- =====================================================================

alter table public.events add column if not exists register_url text;
alter table public.events add column if not exists description text;

alter table public.events drop constraint if exists events_register_url_check;
alter table public.events add constraint events_register_url_check
  check (register_url is null or register_url ~* '^https?://[^\s]+$');

alter table public.events drop constraint if exists events_description_check;
alter table public.events add constraint events_description_check
  check (description is null or char_length(description) <= 1500);
