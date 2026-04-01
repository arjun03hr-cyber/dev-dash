-- Run this in Supabase SQL Editor to allow public (anonymous) read access

-- Drop old SELECT policies that required authentication
drop policy if exists "Evaluations are viewable by authenticated users" on evaluations;
drop policy if exists "Teams viewable by authenticated users" on teams;
drop policy if exists "History viewable by authenticated users" on score_history;

-- New SELECT policies: allow everyone (including anonymous)
create policy "Evaluations are viewable by everyone"
  on evaluations for select
  using ( true );

create policy "Teams viewable by everyone"
  on teams for select
  using ( true );

create policy "History viewable by everyone"
  on score_history for select
  using ( true );
