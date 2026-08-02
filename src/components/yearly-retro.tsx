import Link from "next/link";
import { Eye } from "lucide-react";

import { retros } from "@/lib/data";
import { cn, formatNumber } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const card =
  "group relative flex h-72 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6";

export function YearlyRetro() {
  // Every card is a placeholder until the retrospectives exist. Rendering a
  // link that goes nowhere — or worse, somewhere unrelated — is a broken
  // promise; plain markup simply looks like what it is.
  const anyLinked = retros.some((retro) => retro.href);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            overline="The Yearly"
            lead="Retro"
            subtitle="Every year, I share my progress both in career and personal life. Coming soon."
            className="mb-8"
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {retros.map((retro, i) => {
            const body = (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Eye className="size-4" />
                  {formatNumber(retro.views)} views
                </span>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">
                  {retro.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {retro.description}
                </p>
                <span className="pointer-events-none absolute -bottom-6 right-2 select-none text-[8rem] leading-none font-bold text-foreground/[0.04] transition-transform duration-500 group-hover:-translate-y-1">
                  {retro.year}
                </span>
              </>
            );

            return (
              <Reveal key={retro.year} delay={i * 0.08}>
                {retro.href ? (
                  <Link
                    href={retro.href}
                    className={cn(card, "transition-colors hover:border-brand/40")}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={card}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>

        {/* The year jump-links only make sense once there is something to jump
            to, so they are hidden entirely rather than left dead. */}
        {anyLinked && (
          <Reveal className="mt-6 flex items-center justify-end gap-4 text-sm text-muted-foreground">
            <div className="mr-auto h-px flex-1 bg-border/60" />
            {retros
              .filter((retro) => retro.href)
              .map((retro) => (
                <Link
                  key={retro.year}
                  href={retro.href!}
                  className="transition-colors hover:text-foreground"
                >
                  {retro.year}
                </Link>
              ))}
            <Link href="/blog" className="transition-colors hover:text-foreground">
              more..
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
