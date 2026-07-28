import { getDb } from "@/server/db";

export type ContentKind = "blog" | "short";

export type Stats = { views: number; likes: number };
export type StatsWithViewer = Stats & { yourLikes: number };

export const MAX_LIKES_PER_VISITOR = 5;

const ZERO: StatsWithViewer = { views: 0, likes: 0, yourLikes: 0 };

/** Shape returned by the record_view / add_likes SQL functions. */
type StatsRow = { views: number; likes: number; your_likes: number };

function fromRow(row: StatsRow | undefined): StatsWithViewer {
  if (!row) return ZERO;
  return {
    views: Number(row.views ?? 0),
    likes: Number(row.likes ?? 0),
    yourLikes: Number(row.your_likes ?? 0),
  };
}

/**
 * Mutations throw. The caller (Elysia) maps that to a 503 — a like that
 * silently vanished is worse than a like that visibly failed.
 */
function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Engagement store unavailable");
  return db;
}

export async function recordView(
  kind: ContentKind,
  slug: string,
  visitor: string,
): Promise<StatsWithViewer> {
  const { data, error } = await requireDb().rpc("record_view", {
    p_kind: kind,
    p_slug: slug,
    p_hash: visitor,
  });

  if (error) throw new Error(`record_view failed: ${error.message}`);
  return fromRow((data as StatsRow[] | null)?.[0]);
}

export async function addLikes(
  kind: ContentKind,
  slug: string,
  visitor: string,
  delta: number,
): Promise<StatsWithViewer> {
  const { data, error } = await requireDb().rpc("add_likes", {
    p_kind: kind,
    p_slug: slug,
    p_hash: visitor,
    p_delta: delta,
  });

  if (error) throw new Error(`add_likes failed: ${error.message}`);
  return fromRow((data as StatsRow[] | null)?.[0]);
}

/**
 * Reads fail soft: a missing or unreachable database renders zeros rather than
 * taking down a page or a build.
 */
export async function getStats(
  kind: ContentKind,
  slug: string,
  visitor?: string,
): Promise<StatsWithViewer> {
  const db = getDb();
  if (!db) return ZERO;

  try {
    const [stats, mine] = await Promise.all([
      db
        .from("content_stats")
        .select("views, likes")
        .eq("kind", kind)
        .eq("slug", slug)
        .maybeSingle(),
      visitor
        ? db
            .from("content_like_log")
            .select("count")
            .eq("kind", kind)
            .eq("slug", slug)
            .eq("visitor_hash", visitor)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (stats.error) throw new Error(stats.error.message);

    return {
      views: Number(stats.data?.views ?? 0),
      likes: Number(stats.data?.likes ?? 0),
      yourLikes: Number(mine.data?.count ?? 0),
    };
  } catch (error) {
    console.warn(`[stats] getStats(${kind}/${slug}) failed:`, error);
    return ZERO;
  }
}

/**
 * Bulk counters for a whole content kind — one round trip for a list page.
 * Slugs with no row yet are simply absent; callers default to zero.
 */
export async function getStatsMap(
  kind: ContentKind,
): Promise<Map<string, Stats>> {
  const db = getDb();
  if (!db) return new Map();

  try {
    const { data, error } = await db
      .from("content_stats")
      .select("slug, views, likes")
      .eq("kind", kind);

    if (error) throw new Error(error.message);

    return new Map(
      (data ?? []).map((row) => [
        row.slug as string,
        { views: Number(row.views ?? 0), likes: Number(row.likes ?? 0) },
      ]),
    );
  } catch (error) {
    console.warn(`[stats] getStatsMap(${kind}) failed:`, error);
    return new Map();
  }
}

/** Attach counters to a list of slugged items for a list page. */
export function withStats<T extends { slug: string }>(
  items: T[],
  stats: Map<string, Stats>,
): (T & Stats)[] {
  return items.map((item) => ({
    ...item,
    views: stats.get(item.slug)?.views ?? 0,
    likes: stats.get(item.slug)?.likes ?? 0,
  }));
}
