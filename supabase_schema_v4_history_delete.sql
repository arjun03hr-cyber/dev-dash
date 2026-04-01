-- Run this in Supabase SQL Editor to allow admins to clear history
create policy "Admins can delete history"
  on score_history for delete
  using ( public.is_admin() );
