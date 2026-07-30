import { getDb } from "@/server/db";
import type { ContentKind } from "@/server/stats";

export const MAX_COMMENT_DEPTH = 4;
export const MAX_COMMENT_LENGTH = 2000;
export const MIN_COMMENT_LENGTH = 2;

export type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type CommentNode = {
  id: string;
  parentId: string | null;
  depth: number;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  author: CommentAuthor;
  replies: CommentNode[];
};

type Row = {
  id: string;
  parent_id: string | null;
  depth: number;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  author_id: string;
};

/**
 * Identity fields as Supabase stores them on auth.users. The providers don't
 * agree on names — GitHub sets user_name and avatar_url, Google sets name and
 * picture — so both spellings are read.
 */
type UserMeta = {
  user_name?: string;
  preferred_username?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
};

export function authorFrom(
  id: string,
  meta: UserMeta | null | undefined,
): CommentAuthor {
  return {
    id,
    name:
      meta?.user_name ??
      meta?.preferred_username ??
      meta?.full_name ??
      meta?.name ??
      "Anonymous",
    avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
  };
}

/**
 * Assemble a flat, chronologically ordered list into a reply tree.
 *
 * Kept out of SQL on purpose. A recursive CTE would be the scalable answer, but
 * a post's thread is bounded by depth 4 and realistically a few hundred rows —
 * one flat SELECT plus a single pass here is cheaper to run and far cheaper to
 * read. Any row whose parent is missing is promoted to the top level rather
 * than dropped, so a broken link never swallows a subtree.
 */
export function buildTree(nodes: CommentNode[]): CommentNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const roots: CommentNode[] = [];

  for (const node of nodes) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }

  return roots;
}

/**
 * Every comment on a piece of content, as a tree.
 *
 * Uses the service-role client so the thread is server-rendered for crawlers
 * and arrives without a flash. Reads fail soft to an empty list — a Supabase
 * outage should cost the discussion, not the article.
 */
export async function getComments(
  kind: ContentKind,
  slug: string,
): Promise<CommentNode[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from("comments")
      .select("id, parent_id, depth, body, created_at, edited_at, deleted_at, author_id")
      .eq("kind", kind)
      .eq("slug", slug)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return [];

    const authors = await resolveAuthors(rows.map((r) => r.author_id));

    const nodes: CommentNode[] = rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      depth: row.depth,
      // A deleted comment keeps its row so replies survive, but its text must
      // never reach the client.
      body: row.deleted_at ? "" : row.body,
      createdAt: row.created_at,
      editedAt: row.edited_at,
      deleted: Boolean(row.deleted_at),
      author: authors.get(row.author_id) ?? authorFrom(row.author_id, null),
      replies: [],
    }));

    return pruneDeleted(buildTree(nodes));
  } catch (error) {
    console.warn(`[comments] getComments(${kind}/${slug}) failed:`, error);
    return [];
  }
}

/** Who commented on each post, for the avatar stack on list cards. */
export type Commenters = {
  /** Most recent distinct commenters first, capped. */
  authors: CommentAuthor[];
  /** Distinct commenters in total, so the card can show "+N". */
  total: number;
};

export const COMMENTER_AVATARS = 3;

/**
 * Distinct commenters per slug for a whole content kind — one query for the
 * list page, mirroring getStatsMap in server/stats.ts.
 *
 * Only ids and timestamps are fetched; bodies are irrelevant here and a list
 * page shouldn't be pulling every comment on the blog into memory.
 */
export async function getCommenterMap(
  kind: ContentKind,
): Promise<Map<string, Commenters>> {
  const out = new Map<string, Commenters>();
  const db = getDb();
  if (!db) return out;

  try {
    const { data, error } = await db
      .from("comments")
      .select("slug, author_id, created_at")
      .eq("kind", kind)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Distinct author ids per slug, newest first — insertion order into a Set
    // does that for free given the descending sort.
    const bySlug = new Map<string, Set<string>>();
    for (const row of (data ?? []) as { slug: string; author_id: string }[]) {
      const set = bySlug.get(row.slug) ?? new Set<string>();
      set.add(row.author_id);
      bySlug.set(row.slug, set);
    }
    if (bySlug.size === 0) return out;

    // Resolve every author once across all posts, not once per post.
    const authors = await resolveAuthors(
      [...bySlug.values()].flatMap((s) => [...s].slice(0, COMMENTER_AVATARS)),
    );

    for (const [slug, ids] of bySlug) {
      out.set(slug, {
        authors: [...ids]
          .slice(0, COMMENTER_AVATARS)
          .map((id) => authors.get(id) ?? authorFrom(id, null)),
        total: ids.size,
      });
    }
    return out;
  } catch (error) {
    console.warn(`[comments] getCommenterMap(${kind}) failed:`, error);
    return out;
  }
}

/**
 * Names and avatars for a set of author ids.
 *
 * One query against the mirrored `profiles` table. This used to be one
 * auth.admin.getUserById call per distinct author — an N+1 over HTTP against a
 * database ~190ms away, on a page that already takes ~1.5s to reach it.
 */
async function resolveAuthors(
  ids: string[],
): Promise<Map<string, CommentAuthor>> {
  const out = new Map<string, CommentAuthor>();
  const db = getDb();
  if (!db) return out;

  const unique = [...new Set(ids)];
  if (unique.length === 0) return out;

  try {
    const { data, error } = await db
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", unique);

    if (error) throw new Error(error.message);

    for (const row of (data ?? []) as {
      id: string;
      name: string | null;
      avatar_url: string | null;
    }[]) {
      out.set(row.id, {
        id: row.id,
        name: row.name ?? "Anonymous",
        avatarUrl: row.avatar_url,
      });
    }
  } catch (error) {
    // Callers fall back to a placeholder author; a missing name shouldn't
    // cost the reader the comment itself.
    console.warn("[comments] resolveAuthors failed:", error);
  }

  return out;
}

/**
 * Drop deleted comments that have nothing living beneath them.
 *
 * The row is kept in the database so a reply never disappears along with the
 * comment it answered — that is the entire reason the delete is soft. Once no
 * descendant survives, there is no thread shape left to preserve and the
 * tombstone is just noise, so it goes.
 *
 * Depth-first, so a tombstone whose only child is itself a pruned tombstone is
 * removed in the same pass.
 */
export function pruneDeleted(nodes: CommentNode[]): CommentNode[] {
  return nodes
    .map((node) => ({ ...node, replies: pruneDeleted(node.replies) }))
    .filter((node) => !node.deleted || node.replies.length > 0);
}

/** Live comments only — deleted ones are not something to advertise a count of. */
export function countComments(nodes: CommentNode[]): number {
  return nodes.reduce(
    (n, node) => n + (node.deleted ? 0 : 1) + countComments(node.replies),
    0,
  );
}
