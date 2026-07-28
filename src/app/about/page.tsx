import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { Polaroid } from "@/components/about/polaroid";
import { TechStack } from "@/components/about/tech-stack";

export const metadata: Metadata = {
  title: "About",
  description: `Frontend engineer, OctaneJS core team, author of Typix — about ${siteConfig.author}.`,
};

// Named to avoid reading as next/link, which this deliberately is not.
function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-foreground underline decoration-brand/50 underline-offset-4 transition-colors hover:decoration-brand"
    >
      {children}
    </a>
  );
}

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* Header with watermark */}
      <header className="relative overflow-hidden pb-10 pt-32 text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-24 -z-10 select-none text-center text-[10rem] font-bold leading-none text-foreground/[0.03] sm:text-[14rem]"
        >
          the story
        </span>

        <Reveal className="flex flex-col items-center">
          <span className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground">
            <UserRound className="size-5" />
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            About <span className="text-primary">Me</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            A story of growth and discovery.
          </p>
        </Reveal>
      </header>

      {/* Bio */}
      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-12 px-6 lg:grid-cols-[auto_1fr]">
        <Reveal className="pt-6">
          <Polaroid />
        </Reveal>

        <Reveal delay={0.1} className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight">
            {siteConfig.author}
          </h2>
          <p className="mt-1 text-muted-foreground">{siteConfig.role}</p>

          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              Hello! You can call me{" "}
              <strong className="font-semibold text-foreground">
                {siteConfig.author}
              </strong>
              .
            </p>
            <p>
              I&apos;m a software engineer currently building AI-powered
              products at Nordra. My work focuses on frontend architecture,
              design systems, performance, and developer experience.
            </p>
            <p>
              Outside of work, I&apos;m a core contributor to{" "}
              <ExternalLink href={siteConfig.work.octane.href}>
                OctaneJS
              </ExternalLink>
              , where I work on the runtime, SSR, hydration, and profiling. I
              also maintain{" "}
              <ExternalLink href={siteConfig.work.typix.href}>
                Typix
              </ExternalLink>
              , an open-source headless rich-text editor built on Lexical.
            </p>
            <p>
              I started writing these posts to better understand the
              technologies I use every day. Over time, they turned into notes
              that others found useful as well. Hopefully you&apos;ll find
              something valuable here too.
            </p>
            <p>Tools I reach for most:</p>
          </div>

          <div className="mt-5">
            <TechStack />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
