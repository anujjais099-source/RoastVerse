-- RoastVerse database schema
-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run)

-- Public profile data for every account. Supabase's built-in `auth.users`
-- table already handles email + password (hashed properly, server-side) —
-- this table just holds the app-specific data linked to each auth user.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text not null,
  country text,
  profile_pic text, -- base64 data URL, or null
  points integer not null default 0,
  roast_count integer not null default 0,
  best_score integer not null default 0,
  used_savage boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- anyone (including logged-out visitors) can read profiles — needed for the
-- public leaderboard and shared profile links
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- you can only edit your own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- automatically create a profile row whenever someone signs up.
-- the username/country come from the "options.data" passed to supabase.auth.signUp()
-- on the client — see src/context/AppContext.jsx handleSignup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, country)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- index for fast leaderboard queries
create index if not exists profiles_points_idx on public.profiles (points desc);
