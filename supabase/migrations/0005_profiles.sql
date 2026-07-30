-- Public profiles, mirrored from auth.users.
--
-- Author identity lived only on auth.users, which has two consequences that
-- both showed up in practice:
--
--   1. The browser can never read it. A comment arriving over realtime carries
--      author_id and nothing else, so it rendered as "Anonymous" until a
--      server re-render -- and on an ISR-cached page that re-render can serve
--      the same stale payload, so the name never arrived at all.
--
--   2. PostgREST cannot join to the auth schema, so the server resolved names
--      with one admin API call per distinct author. An N+1 over HTTP.
--
-- A mirrored table in the public schema fixes both: it is joinable, and it is
-- readable by anyone. Only display fields are copied -- never the email.

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default 'Anonymous',
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Public read: these are the names and avatars already printed next to every
-- comment, so there is nothing here that isn't on the page already.
create policy "profiles are publicly readable"
  on profiles for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy. The trigger below is the only writer, so a
-- signed-in user cannot rename themselves to someone else.

-- ---------------------------------------------------------------------------
-- Keep it in sync with auth.users.
--
-- The providers disagree on where the name lives: GitHub sets user_name,
-- Google sets name and picture. Coalescing here means the application stops
-- caring which provider a commenter used.
-- ---------------------------------------------------------------------------
create or replace function sync_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, name, avatar_url, updated_at)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      'Anonymous'
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    ),
    now()
  )
  on conflict (id) do update
    set name       = excluded.name,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end;
$$;

create trigger sync_profile_on_insert
  after insert on auth.users
  for each row execute function sync_profile();

-- Also on update: signing in with a second provider rewrites the metadata, and
-- a renamed GitHub account should update every past comment rather than
-- leaving a stale name frozen in place.
create trigger sync_profile_on_update
  after update of raw_user_meta_data on auth.users
  for each row execute function sync_profile();

-- Backfill everyone who signed up before this migration.
insert into profiles (id, name, avatar_url)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'user_name', ''),
    nullif(u.raw_user_meta_data ->> 'preferred_username', ''),
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    'Anonymous'
  ),
  coalesce(
    nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(u.raw_user_meta_data ->> 'picture', '')
  )
from auth.users u
on conflict (id) do update
  set name       = excluded.name,
      avatar_url = excluded.avatar_url,
      updated_at = now();
