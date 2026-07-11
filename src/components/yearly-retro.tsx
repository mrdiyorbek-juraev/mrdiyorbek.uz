import Link from "next/link";
import { Eye } from "lucide-react";

import { retros } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export function YearlyRetro() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            overline="The Yearly"
            lead="Retro"
            subtitle="Every year, I share my progress both in career and personal life. Here's last 3 years of them."
            className="mb-8"
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {retros.map((retro, i) => (
            <Reveal key={retro.year} delay={i * 0.08}>
              <Link
                href={retro.href}
                className="group relative flex h-72 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 transition-colors hover:border-brand/40"
              >
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
                <span className="pointer-events-none absolute -bottom-6 right-2 select-none text-[8rem] font-bold leading-none text-foreground/[0.04] transition-transform duration-500 group-hover:-translate-y-1">
                  {retro.year}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-6 flex items-center justify-end gap-4 text-sm text-muted-foreground">
          <div className="mr-auto h-px flex-1 bg-border/60" />
          {retros.map((retro) => (
            <Link
              key={retro.year}
              href={retro.href}
              className="transition-colors hover:text-foreground"
            >
              {retro.year}
            </Link>
          ))}
          <Link href="/blog" className="transition-colors hover:text-foreground">
            more..
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
