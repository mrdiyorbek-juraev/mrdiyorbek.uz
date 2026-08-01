"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A rewrite, shown as a toggle rather than two stacked blocks.
 *
 * Stacking both invites skimming past the "before". Making them occupy the
 * same space forces a comparison, which is the entire point of the example —
 * and the word counts are the argument, so they stay visible in both states.
 */
export function BeforeAfter({
  title,
  before,
  after,
  beforeWords,
  afterWords,
  flags = "",
}: {
  title: string;
  before: string;
  after: string;
  /** Strings, not numbers — this MDX pipeline drops expression attributes. */
  beforeWords?: string;
  afterWords?: string;
  /** Pipe-separated, for the same reason: `flags={[...]}` never arrives. */
  flags?: string;
}) {
  const [showAfter, setShowAfter] = React.useState(false);

  const flagList = flags
    .split("|")
    .map((f) => f.trim())
    .filter(Boolean);
  const beforeCount = beforeWords ? Number(beforeWords) : undefined;
  const afterCount = afterWords ? Number(afterWords) : undefined;

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-border/70 bg-card/50">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </span>

        <div className="inline-flex rounded-lg border border-border/70 p-0.5">
          {(["before", "after"] as const).map((side) => {
            const active = (side === "after") === showAfter;
            return (
              <button
                key={side}
                type="button"
                aria-pressed={active}
                onClick={() => setShowAfter(side === "after")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {side}
              </button>
            );
          })}
        </div>
      </figcaption>

      <div className="px-5 py-4">
        <p
          className={cn(
            "text-[0.97rem] leading-relaxed",
            !showAfter && "text-muted-foreground",
          )}
        >
          {showAfter ? after : before}
        </p>

        {(beforeCount ?? afterCount) != null && (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {showAfter ? afterCount : beforeCount} words
            {showAfter && beforeCount != null && afterCount != null && (
              <span className="ml-2 normal-case tracking-normal">
                — {afterCount > beforeCount ? "longer" : "shorter"}, spread over
                more sentences
              </span>
            )}
          </p>
        )}

        {!showAfter && flagList.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
            {flagList.map((flag) => (
              <li
                key={flag}
                className="flex gap-2 text-sm text-muted-foreground"
              >
                <ArrowRight className="mt-1 size-3.5 shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </figure>
  );
}
