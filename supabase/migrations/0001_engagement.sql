-- Engagement (views + likes) for blog posts and shorts.
--
-- Design: two append-style ledgers hold the truth, one denormalized row per
-- piece of content caches the totals. Every read path hits the cache; the
-- ledgers exist so the numbers can be recomputed and so the abuse limits are
-- enforced by constraints rather than by application code.
--
-- Read time is NOT stored here. It is derived from the MDX at build time.

create type content_kind as enum ('blog', 'short');

-- ---------------------------------------------------------------------------
-- Counter cache
-- ---------------------------------------------------------------------------
create table content_stats (
  kind       content_kind not null,
  slug       text         not null,
  views      bigint       not null default 0,
  likes      bigint       not null default 0,
  updated_at timestamptz  not null default now(),
  primary key (kind, slug)
);

-- ---------------------------------------------------------------------------
-- View ledger. The primary key *is* the "one view per visitor per day" rule:
-- a repeat view collides and is discarded, so no counter moves.
-- ---------------------------------------------------------------------------
create table content_view_log (
  kind         content_kind not null,
  slug         text         not null,
  visitor_hash text         not null,
  day          date         not null default current_date,
  primary key (kind, slug, visitor_hash, day)
);

-- ---------------------------------------------------------------------------
-- Like ledger. The check constraint *is* the per-visitor cap.
-- ---------------------------------------------------------------------------
create table content_like_log (
  kind         content_kind not null,
  slug         text         not null,
  visitor_hash text         not null,
  count        smallint     not null default 1 check (count between 1 and 5),
  updated_at   timestamptz  not null default now(),
  primary key (kind, slug, visitor_hash)
);

-- ---------------------------------------------------------------------------
-- No policies, by design. These tables are reachable only through the
-- service-role key held server-side, which bypasses RLS. RLS-on + zero
-- policies means the anon key cannot read or write them even if it leaks.
-- ---------------------------------------------------------------------------
alter table content_stats    enable row level security;
alter table content_view_log enable row level security;
alter table content_like_log enable row level security;

-- ---------------------------------------------------------------------------
-- record_view: idempotent per (content, visitor, day).
-- ---------------------------------------------------------------------------
create or replace function record_view(
  p_kind content_kind,
  p_slug text,
  p_hash text
)
returns table (views bigint, likes bigint, your_likes smallint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int;
  v_delta    int;
  v_stats    content_stats;
begin
  insert into content_view_log (kind, slug, visitor_hash, day)
  values (p_kind, p_slug, p_hash, current_date)
  on conflict do nothing
  returning 1 into v_inserted;

  -- Explicit null-check rather than FOUND: a conflicting insert reports zero
  -- affected rows, and being obvious about that beats being clever.
  v_delta := case when v_inserted is null then 0 else 1 end;

  insert into content_stats (kind, slug, views)
  values (p_kind, p_slug, v_delta)
  on conflict (kind, slug) do update
    set views      = content_stats.views + v_delta,
        updated_at = now()
  returning * into v_stats;

  return query
  select
    v_stats.views,
    v_stats.likes,
    coalesce(
      (select l.count
         from content_like_log l
        where l.kind = p_kind and l.slug = p_slug and l.visitor_hash = p_hash),
      0::smallint
    );
end;
$$;

-- ---------------------------------------------------------------------------
-- add_likes: clap-style. Clamps to 5 per visitor per post server-side, so a
-- tampered delta caps out instead of erroring, and only the *applied*
-- difference reaches the counter.
-- ---------------------------------------------------------------------------
create or replace function add_likes(
  p_kind  content_kind,
  p_slug  text,
  p_hash  text,
  p_delta int
)
returns table (views bigint, likes bigint, your_likes smallint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev    smallint := 0;
  v_next    smallint;
  v_applied int;
  v_stats   content_stats;
begin
  if p_delta < 1 then
    raise exception 'delta must be at least 1, got %', p_delta;
  end if;

  select l.count into v_prev
    from content_like_log l
   where l.kind = p_kind and l.slug = p_slug and l.visitor_hash = p_hash
     for update;

  v_prev    := coalesce(v_prev, 0);
  v_next    := least(v_prev + p_delta, 5);
  v_applied := v_next - v_prev;

  if v_applied = 0 then
    -- Already maxed out. Report current state without touching anything.
    select * into v_stats
      from content_stats
     where kind = p_kind and slug = p_slug;

    return query select
      coalesce(v_stats.views, 0::bigint),
      coalesce(v_stats.likes, 0::bigint),
      v_next;
    return;
  end if;

  insert into content_like_log (kind, slug, visitor_hash, count)
  values (p_kind, p_slug, p_hash, v_next)
  on conflict (kind, slug, visitor_hash) do update
    set count      = v_next,
        updated_at = now();

  insert into content_stats (kind, slug, likes)
  values (p_kind, p_slug, v_applied)
  on conflict (kind, slug) do update
    set likes      = content_stats.likes + v_applied,
        updated_at = now()
  returning * into v_stats;

  return query select v_stats.views, v_stats.likes, v_next;
end;
$$;

-- ---------------------------------------------------------------------------
-- reconcile_stats: rebuild the cache from the ledgers.
--
-- The ledgers are authoritative; content_stats is a cache. Two simultaneous
-- first-likes from the same visitor can drift the cached total by a click or
-- two, so this is the repair tool. Run it by hand, or on a cron.
-- ---------------------------------------------------------------------------
create or replace function reconcile_stats()
returns void
language sql
security definer
set search_path = public
as $$
  with v as (
    select kind, slug, count(*)::bigint as views
      from content_view_log group by kind, slug
  ), l as (
    select kind, slug, coalesce(sum(count), 0)::bigint as likes
      from content_like_log group by kind, slug
  ), merged as (
    select
      coalesce(v.kind, l.kind) as kind,
      coalesce(v.slug, l.slug) as slug,
      coalesce(v.views, 0)     as views,
      coalesce(l.likes, 0)     as likes
    from v full outer join l on v.kind = l.kind and v.slug = l.slug
  )
  insert into content_stats (kind, slug, views, likes)
  select kind, slug, views, likes from merged
  on conflict (kind, slug) do update
    set views      = excluded.views,
        likes      = excluded.likes,
        updated_at = now();
$$;

-- Only the service role executes these; revoke the default public grant.
revoke all on function record_view(content_kind, text, text)        from public, anon, authenticated;
revoke all on function add_likes(content_kind, text, text, int)      from public, anon, authenticated;
revoke all on function reconcile_stats()                             from public, anon, authenticated;
