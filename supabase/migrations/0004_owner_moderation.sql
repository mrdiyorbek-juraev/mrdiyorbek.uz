-- Give the site owner moderation powers over comments.
--
-- 0003 keyed every policy to `author_id = auth.uid()`, which left no way to
-- remove someone else's spam except editing the table by hand. A public
-- comment box needs a moderator, and on a personal blog that is one person.
--
-- The owner is stored in a settings table rather than hardcoded into policies,
-- so changing it is an UPDATE instead of a migration, and app code and database
-- read the same source of truth.

create table if not exists site_settings (
  key   text primary key,
  value text not null
);

alter table site_settings enable row level security;
-- No policies: readable only by the service role. Nothing here is secret, but
-- nothing here needs to be public either.

insert into site_settings (key, value)
values ('owner_user_id', 'f01aca7e-67bc-4c20-acbf-5e7e61aa8fce')
on conflict (key) do update set value = excluded.value;

-- Stable + security definer so RLS policies can call it cheaply. Without
-- SECURITY DEFINER the policy would recurse into site_settings' own RLS and
-- always see nothing.
create or replace function is_site_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from site_settings
     where key = 'owner_user_id'
       and value = auth.uid()::text
  );
$$;

-- ---------------------------------------------------------------------------
-- Moderation: the owner may act on any comment, everyone else only their own.
-- ---------------------------------------------------------------------------
drop policy if exists "authors update their own comments" on comments;
create policy "authors update their own comments"
  on comments for update
  to authenticated
  using ((author_id = auth.uid() and deleted_at is null) or is_site_owner())
  -- The owner may not rewrite authorship; comments_before_update_trg pins
  -- author_id, kind, slug, parent_id and depth to their old values anyway.
  with check (author_id = auth.uid() or is_site_owner());

drop policy if exists "authors delete their own comments" on comments;
create policy "authors delete their own comments"
  on comments for delete
  to authenticated
  using (author_id = auth.uid() or is_site_owner());

-- ---------------------------------------------------------------------------
-- The rate limit exists to stop a stranger flooding the thread. Replying to a
-- morning's worth of comments is exactly what the owner should be doing, so
-- exempt them -- while keeping every other rule (depth, parent, length).
-- ---------------------------------------------------------------------------
create or replace function comments_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent comments;
  v_recent int;
  v_owner  text;
begin
  if new.parent_id is not null then
    select * into v_parent from comments where id = new.parent_id;

    if v_parent.id is null then
      raise exception 'parent comment does not exist';
    end if;

    if v_parent.kind <> new.kind or v_parent.slug <> new.slug then
      raise exception 'parent belongs to different content';
    end if;

    new.depth := least(v_parent.depth + 1, 4);
  else
    new.depth := 0;
  end if;

  select value into v_owner from site_settings where key = 'owner_user_id';

  if v_owner is null or new.author_id::text <> v_owner then
    select count(*) into v_recent
      from comments
     where author_id = new.author_id
       and created_at > now() - interval '10 minutes';

    if v_recent >= 5 then
      raise exception 'rate limit: too many comments, try again in a few minutes'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;
