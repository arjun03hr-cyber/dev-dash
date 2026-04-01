-- =============================================
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Teams table (dynamic teams instead of hardcoded list)
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teams enable row level security;

create policy "Teams viewable by authenticated users"
  on teams for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can insert teams"
  on teams for insert
  with check ( public.is_admin() );

create policy "Admins can delete teams"
  on teams for delete
  using ( public.is_admin() );

-- Insert the default teams
insert into public.teams (name) values
  ('AI allies'), ('Dev Dominators'), ('RR RANGERS'), ('PROMPT ENGINEER''S'), ('Team YS'),
  ('SCRIPT STROM'), ('Future Builders'), ('Ctrl Alt Elite'), ('Byte-Sized Brains'),
  ('CODE WARRIORS!!'), ('TEAM PROTON'), ('Hercules'), ('The Debuggers'), ('WEB WARRIORS'),
  ('Copx'), ('PARALLAX'), ('Team Kanha'), ('ERROR 404'), ('Bug Hunters'), ('Zig and Zag');


-- 2. Score history table (audit log of every score change)
create table public.score_history (
  id uuid default uuid_generate_v4() primary key,
  team_name text not null,
  criterion text not null,
  old_value integer,
  new_value integer,
  changed_by text not null,
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.score_history enable row level security;

create policy "History viewable by authenticated users"
  on score_history for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can insert history"
  on score_history for insert
  with check ( public.is_admin() );
