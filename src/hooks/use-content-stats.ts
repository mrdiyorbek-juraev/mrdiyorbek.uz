"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  MAX_LIKES_PER_VISITOR,
  api,
  type ContentKind,
  type StatsWithViewer,
} from "@/lib/api";

const FLUSH_DELAY = 600;

/**
 * In-flight view requests, keyed by content. Two effect runs for the same
 * article share one promise rather than one flag, so StrictMode's double
 * invoke can neither double-count nor race a stale read over a fresh write.
 */
const inflight = new Map<string, Promise<StatsWithViewer | null>>();

async function loadStats(
  kind: ContentKind,
  slug: string,
): Promise<StatsWithViewer | null> {
  const key = `view:${kind}:${slug}`;

  if (sessionStorage.getItem(key) !== null) {
    const { data } = await api.content({ kind })({ slug }).get();
    return (data as StatsWithViewer | null) ?? null;
  }

  const { data, error } = await api.content({ kind })({ slug }).view.post();
  if (error) throw new Error(String(error.status));

  // Written only once the view is actually banked. Marking it up front would
  // let a single failed request cost the reader their view for the whole
  // session, with no retry.
  sessionStorage.setItem(key, "1");
  return (data as StatsWithViewer | null) ?? null;
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
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = React.useCallback((next: StatsWithViewer) => {
    ref.current = next;
    setStats(next);
  }, []);

  const flush = React.useCallback(async () => {
    const delta = pending.current;
    pending.current = 0;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (delta < 1) return;

    try {
      const { data, error } = await api
        .content({ kind })({ slug })
        .like.post({ delta });
      if (error) throw new Error(String(error.status));
      if (data) commit(data as StatsWithViewer);
    } catch {
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

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), FLUSH_DELAY);
  }, [commit, flush]);

  // Record the view (or just read current counters if already recorded).
  React.useEffect(() => {
    let cancelled = false;

    loadStatsOnce(kind, slug)
      .then((data) => {
        if (cancelled || !data) return;
        commit(data);
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
  }, [kind, slug, commit]);

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
