import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A boxed aside for a claim the argument leans on. */
export function Callout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "my-7 rounded-xl border-l-4 border-primary/70 bg-card/60 px-5 py-4",
        "[&>p:first-child]:mt-0 [&>p:last-child]:mb-0",
        className,
      )}
    >
      {children}
    </aside>
  );
}

/**
 * The turn in the argument — set larger, with rules above and below.
 *
 * Not a <blockquote>: nothing is being quoted, and the prose styles already
 * give blockquote an italic, attributed look that would misrepresent this.
 */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <div className="my-10 border-y-2 border-foreground/80 py-6">
      {/* div, not p. MDX wraps a component's children in a <p> as soon as they
          span more than one line, and a <p> inside a <p> is invalid HTML that
          React reports as a hydration error. Single-line usage stayed inline
          and looked fine, which is what made it intermittent.
          [&>p]:my-0 strips the article paragraph margin off that wrapper. */}
      <div className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl [&>p]:my-0 [&>strong]:text-primary">
        {children}
      </div>
    </div>
  );
}

/** Small monospace section marker, mirroring the essay's numbered structure. */
export function Step({ children }: { children: ReactNode }) {
  // div for the same reason as PullQuote — a bare <p> here breaks the moment
  // someone writes the label across two lines.
  return (
    <div className="mt-12 mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary [&>p]:my-0">
      {children}
    </div>
  );
}
