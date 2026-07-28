-- Fix reconcile_stats(): sweep every known key, not just keys still present in
-- the ledgers.
--
-- The original built its result from a full outer join of the two ledgers, so a
-- content_stats row whose ledger entries had all been deleted never appeared in
-- the join and kept its stale counter forever — precisely the row most likely
-- to need repairing. Driving the sweep from the union of all three tables makes
-- the counters a true function of the ledgers, including zeroing rows whose
-- ledger entries are gone.

create or replace function reconcile_stats()
returns void
language sql
security definer
set search_path = public
as $$
  with keys as (
    select kind, slug from content_stats
    union
    select kind, slug from content_view_log
    union
    select kind, slug from content_like_log
  )
  insert into content_stats (kind, slug, views, likes)
  select
    k.kind,
    k.slug,
    (select count(*)
       from content_view_log v
      where v.kind = k.kind and v.slug = k.slug),
    (select coalesce(sum(l.count), 0)
       from content_like_log l
      where l.kind = k.kind and l.slug = k.slug)
  from keys k
  on conflict (kind, slug) do update
    set views      = excluded.views,
        likes      = excluded.likes,
        updated_at = now();
$$;

revoke all on function reconcile_stats() from public, anon, authenticated;
