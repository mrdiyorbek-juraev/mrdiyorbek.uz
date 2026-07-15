import type { Metadata } from "next";
import { UserRound, Sparkle } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { Polaroid } from "@/components/about/polaroid";
import { TechStack } from "@/components/about/tech-stack";

export const metadata: Metadata = {
  title: "About",
  description: `A story of growth and discovery — about ${siteConfig.author}..`
};

const nowItems = [
  {
    emoji: "✈️",
    text: "I regularly solo travel, usually for 2 weeks at a time.",
    highlight: "7 times so far",
  },
  {
    emoji: "🪂",
    text: "I'm a licensed skydiver and a scuba diver.",
    highlight: "85 jumps so far",
  },
  {
    emoji: "📚",
    text: "Reading more long-form and writing notes in public.",
    highlight: "12 books this year",
  },
  {
    emoji: "🛠️",
    text: "Building small tools and open-source side projects.",
    highlight: "on most weekends",
  },
];

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
              . I&apos;m a software engineer who works with the React ecosystem
              and writes to teach people how to rebuild and redefine fundamental
              concepts through mental models.
            </p>
            <p>
              When I first got into web development, I learned front-end out of
              curiosity — and never really stopped. What started as tinkering
              slowly turned into the thing I care about most.
            </p>
            <p>
              As part of my learning journey, I started writing articles as a way
              to solidify my knowledge. When I posted them here as documentation,
              I discovered that many people found them valuable. Hopefully, it can
              help you too.
            </p>
            <p>
              I&apos;m also a full-stack engineer — here are my current favorite
              tools:
            </p>
          </div>

          <div className="mt-5">
            <TechStack />
          </div>
        </Reveal>
      </section>

      {/* What I'm up to now */}
      <section className="mx-auto mt-20 w-full max-w-5xl px-6">
        <Reveal>
          <div className="grid gap-8 rounded-3xl border border-border/60 bg-card/40 p-8 md:grid-cols-[16rem_1fr]">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-secondary/50 text-primary">
                <Sparkle className="size-5" />
              </span>
              <h2 className="pt-1.5 text-xl font-semibold tracking-tight">
                What I&apos;m up to now
              </h2>
            </div>

            <ul className="space-y-4">
              {nowItems.map((item) => (
                <li key={item.text} className="flex gap-3 text-muted-foreground">
                  <span aria-hidden>{item.emoji}</span>
                  <span>
                    {item.text}{" "}
                    <span className="font-medium text-foreground underline decoration-brand/50 underline-offset-4">
                      {item.highlight}
                    </span>
                    .
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
