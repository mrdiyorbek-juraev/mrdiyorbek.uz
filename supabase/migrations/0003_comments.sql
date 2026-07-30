-- Nested comments on blog posts and shorts.
--
-- Unlike the engagement tables, this one carries real RLS policies. Those
-- tables are anonymous counters that only the service role may touch; comments
-- are written straight from the browser using the commenter's own JWT, so
-- Postgres itself has to decide who may write what. auth.uid() makes that
-- possible without an API layer in between.

create table comments (
  id         uuid primary key default gen_random_uuid(),
  kind       content_kind not null,          -- reuses the enum from 0001
  slug       text not null,
  parent_id  uuid references comments(id) on delete cascade,
  depth      smallint not null default 0 check (depth between 0 and 4),
  author_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null
             check (char_length(btrim(body)) between 2 and 2000),
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  -- Soft delete: a removed comment keeps its row so replies underneath it do
  -- not vanish with it. The UI renders it as "[deleted]".
  deleted_at timestamptz
);

-- Author name and avatar are deliberately NOT copied in. They live on
-- auth.users and are read at query time, so renaming a GitHub account updates
-- every past comment instead of freezing a stale name into each row.

create index comments_thread_idx on comments (kind, slug, created_at);
create index comments_parent_idx on comments (parent_id);
create index comments_author_recent_idx on comments (author_id, created_at desc);

-- ---------------------------------------------------------------------------
-- One trigger enforces the three structural rules, so none of them can be
-- bypassed by writing directly to the table.
-- ---------------------------------------------------------------------------
create or replace function comments_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent   comments;
  v_recent   int;
begin
  if new.parent_id is not null then
    select * into v_parent from comments where id = new.parent_id;

    if v_parent.id is null then
      raise exception 'parent comment does not exist';
    end if;

    -- A reply must live on the same piece of content as its parent, or the
    -- thread could be spliced across posts.
    if v_parent.kind <> new.kind or v_parent.slug <> new.slug then
      raise exception 'parent belongs to different content';
    end if;

    -- Depth is derived, never trusted from the client. Past the cap a reply
    -- attaches at the deepest allowed level rather than being rejected --
    -- the component indents each level and is unreadable on a phone by then.
    new.depth := least(v_parent.depth + 1, 4);
  else
    new.depth := 0;
  end if;

  -- Rate limit. Free text cannot be capped by a unique constraint the way the
  -- like allowance is, so this is the equivalent guard.
  select count(*) into v_recent
    from comments
   where author_id = new.author_id
     and created_at > now() - interval '10 minutes';

  if v_recent >= 5 then
    raise exception 'rate limit: too many comments, try again in a few minutes'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger comments_before_insert_trg
  before insert on comments
  for each row execute function comments_before_insert();

-- Keep edited_at honest, and stop a body edit from rewriting authorship.
create or replace function comments_before_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  new.author_id  := old.author_id;
  new.kind       := old.kind;
  new.slug       := old.slug;
  new.parent_id  := old.parent_id;
  new.depth      := old.depth;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger comments_before_update_trg
  before update on comments
  for each row execute function comments_before_update();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table comments enable row level security;

-- Public read. Deleted rows are returned too so the thread keeps its shape;
-- the UI blanks the body.
create policy "comments are publicly readable"
  on comments for select
  to anon, authenticated
  using (true);

-- You may only insert as yourself, and only as a live comment.
create policy "authors insert their own comments"
  on comments for insert
  to authenticated
  with check (author_id = auth.uid() and deleted_at is null);

-- You may only edit your own, and only while it is not deleted.
create policy "authors update their own comments"
  on comments for update
  to authenticated
  using (author_id = auth.uid() and deleted_at is null)
  with check (author_id = auth.uid());

-- Hard delete is allowed for your own row. The UI prefers a soft delete
-- (setting deleted_at through the update policy) to preserve replies.
create policy "authors delete their own comments"
  on comments for delete
  to authenticated
  using (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Live updates. Guarded so re-running is safe.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
      from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table comments;
  end if;
end
$$;
