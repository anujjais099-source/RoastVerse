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

-- ===================================================================
-- Social features: friend requests, chat, posts, stories
-- Run this section the same way — Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- ===================================================================

-- Friendships: one row per requester -> recipient pair. status moves
-- pending -> accepted/declined. Once accepted it's treated as mutual —
-- the app checks both columns to find "my friends".
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (requester_id, recipient_id),
  check (requester_id <> recipient_id)
);

alter table public.friendships enable row level security;

create policy "See friendships you're part of"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Send friend requests as yourself"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Respond to or cancel your own friendships"
  on public.friendships for update
  using (auth.uid() = recipient_id or auth.uid() = requester_id);

create policy "Remove your own friendships"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_recipient_idx on public.friendships (recipient_id);

-- Direct messages between two people.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Read your own conversations"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Send messages as yourself"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create index if not exists messages_conversation_idx on public.messages (sender_id, recipient_id, created_at);

-- Adds `messages` to the realtime publication so chat updates live via
-- supabase.channel(...).on('postgres_changes', ...) without polling.
-- (Equivalent to toggling it on in Dashboard -> Database -> Replication.)
alter publication supabase_realtime add table public.messages;

-- Posts: a caption and/or photo, visible to everyone (the app itself only
-- fetches posts from the signed-in user's friends + their own).
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  caption text,
  photo text, -- base64 data URL, or null
  created_at timestamptz not null default now(),
  check (coalesce(caption, '') <> '' or photo is not null)
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Create your own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Delete your own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

create index if not exists posts_created_idx on public.posts (created_at desc);

-- Stories: same shape as posts, but expire 24 hours after posting.
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  photo text,
  caption text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

alter table public.stories enable row level security;

create policy "Unexpired stories are viewable by everyone"
  on public.stories for select
  using (expires_at > now());

create policy "Create your own stories"
  on public.stories for insert
  with check (auth.uid() = author_id);

create policy "Delete your own stories"
  on public.stories for delete
  using (auth.uid() = author_id);

create index if not exists stories_created_idx on public.stories (created_at desc);
