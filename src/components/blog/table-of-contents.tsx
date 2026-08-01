"use client";

import * as React from "react";
import { useLenis } from "lenis/react";
import { List } from "lucide-react";

import type { Heading } from "@/lib/toc";
import { cn } from "@/lib/utils";

/** Roughly the fixed header, so a target doesn't land underneath it. */
const SCROLL_OFFSET = -96;

/**
 * Tracks which heading the reader is currently under.
 *
 * IntersectionObserver rather than a scroll handler: it fires only on
 * threshold crossings instead of on every frame of a scroll.
 *
 * The rootMargin is the interesting part. It shrinks the viewport to a band
 * just below the header. Without the large bottom inset, every heading below
 * the fold counts as intersecting on load and the last one wins — the list
 * would open with the final section highlighted.
 */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting);
        // Document order, not callback order — entries arrive unsorted.
        const current = ids.find((id) => seen.get(id));
        if (current) setActive(current);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function Links({
  headings,
  active,
  onNavigate,
}: {
  headings: Heading[];
  active: string | null;
  onNavigate?: () => void;
}) {
  const lenis = useLenis();

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    onNavigate?.();
    if (!lenis) return; // No Lenis: let the browser handle it via CSS.

    const target = document.getElementById(id);
    if (!target) return;

    // Lenis takes over the scroll container and sets
    // `scroll-behavior: auto !important`, so the CSS rule cannot animate an
    // anchor jump. Drive it through Lenis instead, and keep the URL hash by
    // writing it manually since preventDefault drops it.
    event.preventDefault();
    lenis.scrollTo(target, { offset: SCROLL_OFFSET });
    history.pushState(null, "", `#${id}`);
  }

  return (
    <ul className="space-y-1 text-sm">
      {headings.map((heading) => {
        const isActive = active === heading.id;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => go(e, heading.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block border-l-2 py-1 transition-colors",
                heading.level === 3 ? "pl-5 text-[0.82rem]" : "pl-3",
                isActive
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * `inline` sits in the article column and only shows below lg.
 * `rail` sits in the aside and only shows at lg and above.
 *
 * They are separate variants rather than one component rendered twice: doing
 * the latter put a second, non-sticky copy of the rail inside the article
 * column at desktop width.
 */
export function TableOfContents({
  headings,
  variant,
}: {
  headings: Heading[];
  variant: "inline" | "rail";
}) {
  const ids = React.useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);

  if (headings.length < 2) return null;

  if (variant === "inline") {
    return (
      // Collapsed by default: expanded, a long list would put a whole screen
      // between the reader and the first paragraph.
      <details className="group rounded-xl border border-border/70 bg-card/40 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <List className="size-4 text-primary" />
          Contents
          <span className="ml-auto text-xs text-muted-foreground transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <nav aria-label="Table of contents" className="px-4 pb-4">
          <Links
            headings={headings}
            active={active}
            // Collapse on tap, or the reader lands on a heading the open list
            // is still covering.
            onNavigate={() => {
              document
                .querySelectorAll<HTMLDetailsElement>("details[open]")
                .forEach((d) => d.removeAttribute("open"));
            }}
          />
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Table of contents
      </p>
      <Links headings={headings} active={active} />
    </nav>
  );
}
