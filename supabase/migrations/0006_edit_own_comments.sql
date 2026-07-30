-- Let authors edit their own comments — and only their own.
--
-- 0004 widened the update policy so the site owner could moderate, which as a
-- side effect let the owner rewrite anyone's text. Deleting someone's comment
-- is visible and honest; silently putting different words in their mouth is
-- not, and it is worse than leaving the comment up.
--
-- The policy still has to allow the owner to UPDATE, because a soft delete is
-- an update. So the split is enforced in the trigger instead, by column:
-- anyone permitted may change deleted_at, but only the author may change body.

create or replace function comments_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.body is distinct from old.body then
    -- auth.uid() is null for the service role, which is how migrations and
    -- server-side maintenance run; those are trusted and skip the check.
    if auth.uid() is not null and auth.uid() <> old.author_id then
      raise exception 'only the author may edit a comment'
        using errcode = 'insufficient_privilege';
    end if;

    if old.deleted_at is not null then
      raise exception 'cannot edit a deleted comment'
        using errcode = 'insufficient_privilege';
    end if;

    -- Stamped here rather than trusted from the client, so "edited" cannot be
    -- hidden by simply not sending the field.
    new.edited_at := now();
  end if;

  -- Identity and position are fixed for the life of the row. Without this an
  -- author could re-parent their comment to dodge the depth cap, or move it to
  -- another post.
  new.author_id  := old.author_id;
  new.kind       := old.kind;
  new.slug       := old.slug;
  new.parent_id  := old.parent_id;
  new.depth      := old.depth;
  new.created_at := old.created_at;

  return new;
end;
$$;

-- Editing requires a live row. The owner branch keeps no such restriction,
-- because moderation must still reach a row in any state.
drop policy if exists "authors update their own comments" on comments;
create policy "authors update their own comments"
  on comments for update
  to authenticated
  using ((author_id = auth.uid() and deleted_at is null) or is_site_owner())
  with check (author_id = auth.uid() or is_site_owner());
