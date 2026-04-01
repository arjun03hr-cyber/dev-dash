-- 1. Create a table for User Profiles (to store roles)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security for profiles
alter table public.profiles enable row level security;

-- Policies for profiles: Everyone can read, only the user themselves can update (or maybe only admins).
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);
create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create a profile entry when a new user signs up in Supabase
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  -- By default, new users are assigned the 'user' role
  -- You must MANUALLY change the first user to 'admin' in the database!
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create the evaluations table
create table public.evaluations (
  id uuid default uuid_generate_v4() primary key,
  team_name text not null unique,
  scores jsonb not null default '{}'::jsonb,
  notes text not null default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for evaluations
alter table public.evaluations enable row level security;

-- Helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
declare
  user_role text;
begin
  select role into user_role from public.profiles where id = auth.uid();
  return user_role = 'admin';
end;
$$ language plpgsql security definer;

-- Policies for evaluations
-- Everyone (authenticated) can select/read evaluations
create policy "Evaluations are viewable by authenticated users" 
  on evaluations for select 
  using ( auth.role() = 'authenticated' );

-- Admins can insert, update, delete
create policy "Admins can insert evaluations" 
  on evaluations for insert 
  with check ( public.is_admin() );

create policy "Admins can update evaluations" 
  on evaluations for update 
  using ( public.is_admin() );

create policy "Admins can delete evaluations" 
  on evaluations for delete 
  using ( public.is_admin() );
