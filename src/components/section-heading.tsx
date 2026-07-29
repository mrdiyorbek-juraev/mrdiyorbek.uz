import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  overline,
  lead,
  highlight,
  underline = false,
  subtitle,
  className,
}: {
  overline?: string;
  lead: string;
  highlight?: string;
  underline?: boolean;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {overline && (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {overline}
        </p>
      )}
      <h2 className="inline-flex flex-wrap items-end gap-x-3 text-4xl font-bold tracking-tight sm:text-5xl">
        <span>{lead}</span>
        {highlight && (
          <span
            className={cn(
              "text-primary",
              underline && "underline decoration-primary/60 underline-offset-8",
            )}
          >
            {highlight}
          </span>
        )}
      </h2>
      {subtitle && <p className="max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function MoreLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  // Project links now point off-site, so route those through a plain anchor —
  // next/link would keep them in the same tab and can't prefetch them anyway.
  const external = /^https?:\/\//.test(href);
  const Tag = external ? "a" : Link;

  return (
    <Tag
      href={href}
      {...(external
        ? { target: "_blank", rel: "noreferrer noopener" as const }
        : {})}
      className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <span className="flex size-5 items-center justify-center rounded-full border border-border/70 bg-secondary/60 transition-colors group-hover:border-brand/50 group-hover:text-primary">
        <ChevronRight className="size-3.5" />
      </span>
    </Tag>
  );
}
