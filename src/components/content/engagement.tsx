"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Eye, Heart } from "lucide-react";

import { MAX_LIKES_PER_VISITOR, type ContentKind } from "@/lib/api";
import { useContentStats } from "@/hooks/use-content-stats";
import { cn, formatNumber } from "@/lib/utils";

type Engagement = ReturnType<typeof useContentStats>;

const EngagementContext = React.createContext<Engagement | null>(null);

function useEngagement() {
  const value = React.useContext(EngagementContext);
  if (!value) {
    throw new Error("useEngagement must be used inside <EngagementProvider>");
  }
  return value;
}

/**
 * Owns the single hook instance for an article, so the view counter in the
 * header and the like button at the foot of the page share one source of truth
 * and one in-flight request.
 */
export function EngagementProvider({
  kind,
  slug,
  children,
}: {
  kind: ContentKind;
  slug: string;
  children: React.ReactNode;
}) {
  const engagement = useContentStats({ kind, slug });
  return (
    <EngagementContext.Provider value={engagement}>
      {children}
    </EngagementContext.Provider>
  );
}

/** Header row: read time comes from the MDX at build time, views from the API. */
export function ArticleStats({
  readingTime,
  className,
}: {
  readingTime?: string;
  className?: string;
}) {
  const { views, loaded } = useEngagement();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {readingTime && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-primary" />
          {readingTime}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <Eye className="size-4 text-primary" />
        {loaded ? `${formatNumber(views)} views` : "— views"}
      </span>
    </div>
  );
}

/**
 * Clap-style like button, capped at five per visitor. Taps register instantly
 * and are flushed as one request; the dots show how much of the allowance is
 * spent.
 */
export function LikeButton({ className }: { className?: string }) {
  const { likes, yourLikes, maxedOut, loaded, like } = useEngagement();

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <button
        type="button"
        onClick={like}
        disabled={maxedOut || !loaded}
        aria-label={
          maxedOut
            ? "You've given this the maximum 5 likes"
            : `Like this post (${yourLikes} of ${MAX_LIKES_PER_VISITOR} given)`
        }
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-card/50 px-5 py-2.5",
          "text-sm font-medium transition-all duration-300",
          "enabled:hover:-translate-y-0.5 enabled:hover:border-primary/50 enabled:hover:bg-card",
          "disabled:cursor-default disabled:opacity-80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <motion.span
          key={yourLikes}
          initial={yourLikes > 0 ? { scale: 0.7 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="inline-flex"
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              yourLikes > 0
                ? "fill-primary text-primary"
                : "text-muted-foreground group-hover:text-primary",
            )}
          />
        </motion.span>

        <span className="tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={likes}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="inline-block"
            >
              {loaded ? formatNumber(likes) : "—"}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: MAX_LIKES_PER_VISITOR }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full transition-colors duration-300",
              i < yourLikes ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {maxedOut
          ? "Thanks — that's all five!"
          : `Tap up to ${MAX_LIKES_PER_VISITOR} times`}
      </p>
    </div>
  );
}
