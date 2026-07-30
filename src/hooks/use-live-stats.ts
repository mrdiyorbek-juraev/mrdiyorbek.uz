"use client";

import * as React from "react";

import { api, type ContentKind } from "@/lib/api";
import { getBrowserClient } from "@/lib/supabase/client";
import { BUMP_EVENT, bumpChannel, type Bump } from "@/hooks/use-content-stats";

export type LiveStats = Record<string, { views: number; likes: number }>;

/**
 * Keeps list-card counters current.
 *
 * List pages are ISR-cached (revalidate = 300), so their server-rendered
 * numbers can be five minutes old — a post read and liked a minute ago still
 * shows the stale figure on the card. Two things fix that:
 *
 *  1. one bulk fetch on mount, which corrects whatever the cache served, and
 *  2. a subscription to the shared per-kind broadcast channel, which keeps it
 *     current while the page stays open.
 *
 * One channel covers every card, because the bump payload carries its slug.
 * Returns an override map; callers merge it over the server-rendered values.
 */
export function useLiveStats(kind: ContentKind): LiveStats {
  const [live, setLive] = React.useState<LiveStats>({});

  // Correct the ISR-cached numbers as soon as the page is interactive.
  React.useEffect(() => {
    let cancelled = false;

    api
      .content({ kind })
      .get()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setLive(data as LiveStats);
      })
      .catch(() => {
        // Cards keep the server-rendered figures.
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  // Then track changes as they happen.
  React.useEffect(() => {
    const db = getBrowserClient();
    if (!db) return;

    const channel = db
      .channel(bumpChannel(kind), { config: { broadcast: { self: false } } })
      .on("broadcast", { event: BUMP_EVENT }, ({ payload }) => {
        const delta = (payload ?? {}) as Bump;
        if (!delta.slug) return;

        setLive((prev) => {
          const cur = prev[delta.slug];
          // A bump for a post whose real total we never fetched would be
          // meaningless on its own, so wait for the bulk fetch to seed it.
          if (!cur) return prev;
          return {
            ...prev,
            [delta.slug]: {
              views: cur.views + (Number(delta.views) || 0),
              likes: cur.likes + (Number(delta.likes) || 0),
            },
          };
        });
      })
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [kind]);

  return live;
}
