"use client";

import * as React from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";

import {
  MAX_LIKES_PER_VISITOR,
  api,
  type ContentKind,
  type StatsWithViewer,
} from "@/lib/api";
import { getBrowserClient } from "@/lib/supabase/client";

/**
 * Only the first tap waits; it fires straight away so other readers see
 * something within one network hop, and the taps behind it coalesce.
 */
const FLUSH_DELAY = 400;

/** Broadcast event carrying what changed, as a delta. */
type Bump = { views?: number; likes?: number };

/**
 * In-flight view requests, keyed by content. Two effect runs for the same
 * article share one promise rather than one flag, so StrictMode's double
 * invoke can neither double-count nor race a stale read over a fresh write.
 */
const inflight = new Map<string, Promise<LoadResult>>();

type LoadResult = {
  stats: StatsWithViewer | null;
  /**
   * True when this load took the write path, i.e. it may have added a view.
   * "May" because the database still dedupes by (visitor, day) — a second
   * session on the same day writes nothing. That makes the broadcast a slight
   * over-signal in that one case, which the next resync corrects.
   */
  recorded: boolean;
};

async function loadStats(
  kind: ContentKind,
  slug: string,
): Promise<LoadResult> {
  const key = `view:${kind}:${slug}`;

  if (sessionStorage.getItem(key) !== null) {
    const { data } = await api.content({ kind })({ slug }).get();
    return { stats: (data as StatsWithViewer | null) ?? null, recorded: false };
  }

  const { data, error } = await api.content({ kind })({ slug }).view.post();
  if (error) throw new Error(String(error.status));

  // Written only once the view is actually banked. Marking it up front would
  // let a single failed request cost the reader their view for the whole
  // session, with no retry.
  sessionStorage.setItem(key, "1");
  return { stats: (data as StatsWithViewer | null) ?? null, recorded: true };
}

function loadStatsOnce(kind: ContentKind, slug: string) {
  const key = `${kind}:${slug}`;
  let pending = inflight.get(key);
  if (!pending) {
    pending = loadStats(kind, slug).finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
}

type Options = {
  kind: ContentKind;
  slug: string;
  /** Server-rendered counters, so the number never flashes 0 → 128. */
  initial?: { views: number; likes: number };
};

/**
 * Records a view once per browser session and manages the visitor's likes.
 *
 * Likes are optimistic and debounced: five quick taps become one request
 * carrying `delta: 5`, and the server's clamped response is authoritative.
 */
export function useContentStats({ kind, slug, initial }: Options) {
  const [stats, setStats] = React.useState<StatsWithViewer>({
    views: initial?.views ?? 0,
    likes: initial?.likes ?? 0,
    yourLikes: 0,
  });
  const [loaded, setLoaded] = React.useState(false);

  // Mirrors `stats` so callbacks never read a stale closure and so the state
  // updater itself stays free of side effects (StrictMode double-invokes it).
  const ref = React.useRef(stats);
  const pending = React.useRef(0);
  // Clicks sent but not yet acknowledged. Together with `pending` these are the
  // likes the database does not know about, which a live update must add back.
  const inFlight = React.useRef(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const channel = React.useRef<RealtimeChannel | null>(null);

  const commit = React.useCallback((next: StatsWithViewer) => {
    ref.current = next;
    setStats(next);
  }, []);

  /**
   * Tell other readers what changed, without waiting on the database.
   *
   * This is the whole point of the broadcast path: a write goes
   * browser → Vercel → Postgres → back, which measures ~1.5s from Central Asia
   * against a Sydney database. A broadcast is one hop to the Realtime server
   * and straight out to every other subscriber.
   *
   * Fire-and-forget by design. A dropped bump self-corrects on the next
   * refetch, and blocking a click on an ack would defeat the purpose.
   */
  const bump = React.useCallback((delta: Bump) => {
    void channel.current?.send({
      type: "broadcast",
      event: "bump",
      payload: delta,
    });
  }, []);

  /** Pull authoritative counters and replace whatever deltas accumulated. */
  const resync = React.useCallback(async () => {
    try {
      const { data } = await api.content({ kind })({ slug }).get();
      if (!data) return;
      const fresh = data as StatsWithViewer;
      commit({
        views: fresh.views,
        // Anything not yet persisted has to be re-added or the reader's own
        // count visibly drops.
        likes: fresh.likes + pending.current + inFlight.current,
        yourLikes: fresh.yourLikes,
      });
    } catch {
      // Keep whatever is on screen.
    }
  }, [kind, slug, commit]);

  const flush = React.useCallback(async () => {
    const delta = pending.current;
    pending.current = 0;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (delta < 1) return;

    inFlight.current += delta;
    try {
      const { data, error } = await api
        .content({ kind })({ slug })
        .like.post({ delta });
      if (error) throw new Error(String(error.status));
      // Cleared before committing: the response is authoritative and already
      // counts these, so leaving them in flight would double them.
      inFlight.current = Math.max(0, inFlight.current - delta);
      if (data) commit(data as StatsWithViewer);
    } catch {
      inFlight.current = Math.max(0, inFlight.current - delta);
      // Roll the optimistic bump back out so the number stays honest.
      const cur = ref.current;
      commit({
        ...cur,
        likes: Math.max(0, cur.likes - delta),
        yourLikes: Math.max(0, cur.yourLikes - delta),
      });
      toast.error("Couldn't save that like. Try again?");
    }
  }, [kind, slug, commit]);

  const like = React.useCallback(() => {
    const cur = ref.current;
    if (cur.yourLikes >= MAX_LIKES_PER_VISITOR) return;

    commit({ ...cur, likes: cur.likes + 1, yourLikes: cur.yourLikes + 1 });
    pending.current += 1;

    // Out to everyone else on this page immediately — before, and independent
    // of, the durable write.
    bump({ likes: 1 });

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), FLUSH_DELAY);
  }, [commit, flush, bump]);

  // Record the view (or just read current counters if already recorded).
  React.useEffect(() => {
    let cancelled = false;

    loadStatsOnce(kind, slug)
      .then(({ stats: fresh, recorded }) => {
        if (cancelled || !fresh) return;
        commit(fresh);
        // Let anyone else reading this page see the view arrive. The channel
        // subscribes in parallel and settles in ~1 hop, well before this
        // request's round trip resolves.
        if (recorded) bump({ views: 1 });
      })
      .catch(() => {
        // Counters are decoration, not content — a failure stays silent, and
        // leaves the session unmarked so the next visit retries.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, slug, commit, bump]);

  // Live counters over Realtime broadcast rather than postgres_changes.
  // postgres_changes rides the write-ahead log, so it inherits the full write
  // latency it was meant to hide; broadcast never touches Postgres.
  React.useEffect(() => {
    const db = getBrowserClient();
    if (!db) return; // No anon key configured — counters just stay static.

    const ch = db.channel(`content:${kind}:${slug}`, {
      // Senders already applied their own change optimistically.
      config: { broadcast: { self: false } },
    });

    ch.on("broadcast", { event: "bump" }, ({ payload }) => {
      const delta = (payload ?? {}) as Bump;
      const cur = ref.current;
      commit({
        views: cur.views + (Number(delta.views) || 0),
        likes: cur.likes + (Number(delta.likes) || 0),
        // Per-visitor, so never something another reader can tell us.
        yourLikes: cur.yourLikes,
      });
    }).subscribe((status) => {
      // A reconnect means bumps were missed while the socket was down, so take
      // the authoritative numbers instead of trusting accumulated deltas.
      if (status === "SUBSCRIBED") channel.current = ch;
    });

    return () => {
      channel.current = null;
      void db.removeChannel(ch);
    };
  }, [kind, slug, commit]);

  // Deltas can be missed — a dropped socket, a backgrounded tab, a forged
  // payload. Re-anchor to the database whenever the reader comes back.
  React.useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") void resync();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [resync]);

  // Don't drop claps that are still pending when the reader navigates away.
  React.useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void flush();
    };
  }, [flush]);

  return {
    ...stats,
    loaded,
    like,
    maxedOut: stats.yourLikes >= MAX_LIKES_PER_VISITOR,
  };
}
