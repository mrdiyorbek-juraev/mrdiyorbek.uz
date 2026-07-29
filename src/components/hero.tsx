"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

import { siteConfig } from "@/lib/site";
import {
  GitHubIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/** Inline link in the hero blurb — monochrome, to match the rest of the section. */
function HeroLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
    </a>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.35]);

  // Cursor-tracked spotlight over the backdrop.
  const mx = useSpring(useMotionValue(50), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(40), { stiffness: 60, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(38rem 30rem at ${mx}% ${my}%, color-mix(in oklch, var(--foreground) 7%, transparent), transparent 70%)`;

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative flex min-h-[92vh] items-center overflow-hidden"
    >
      {/* ---- Backdrop ---- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Neutral light mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="aurora-a absolute -left-[10%] top-[-10%] size-[42rem] rounded-full bg-[radial-gradient(circle_at_center,var(--foreground),transparent_65%)] opacity-[0.07] blur-[110px] dark:opacity-[0.09]" />
          <div className="aurora-b absolute right-[-8%] top-[6%] size-[36rem] rounded-full bg-[radial-gradient(circle_at_center,var(--foreground),transparent_65%)] opacity-[0.05] blur-[120px] dark:opacity-[0.07]" />
          <div className="aurora-c absolute bottom-[-18%] left-[28%] size-[40rem] rounded-full bg-[radial-gradient(circle_at_center,var(--foreground),transparent_65%)] opacity-[0.04] blur-[130px] dark:opacity-[0.06]" />
        </div>

        {/* Grid + cursor spotlight */}
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-60" />
        <motion.div style={{ background: spotlight }} className="absolute inset-0" />

        {/* Grain, then a fade into the next section */}
        <div className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-overlay dark:opacity-[0.06]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <motion.div
        style={{ y: textY, opacity: fade }}
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-6xl px-6 pt-28 lg:pt-24"
      >
        <div className="max-w-xl">
        <motion.div variants={item}>
          <span className="gradient-ring glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-sm text-foreground/90 shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_25%,transparent)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/50" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground/80" />
            </span>
            {siteConfig.status}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-7 text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient">I&apos;m </span>
          <span className="text-shimmer">{siteConfig.name}</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-sm"
        >
          {siteConfig.role}
          {/* Rule shrinks first so the longer title never wraps mid-phrase. */}
          <span className="h-px w-16 min-w-4 shrink bg-gradient-to-r from-foreground/30 to-transparent" />
        </motion.p>

        <motion.p
          variants={item}
          className="mt-6 text-lg leading-relaxed text-muted-foreground"
        >
          I&apos;m on the core team at{" "}
          <HeroLink href={siteConfig.work.octane.href}>
            {siteConfig.work.octane.name}
          </HeroLink>
          , a compiled framework that keeps React&apos;s programming model and
          drops the virtual DOM. I also write{" "}
          <HeroLink href={siteConfig.work.typix.href}>
            {siteConfig.work.typix.name}
          </HeroLink>
          , a headless rich-text editor framework for React.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/blog"
            className="cta-gradient group inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-background outline-none focus-visible:ring-3 focus-visible:ring-foreground/30"
          >
            Read the blog
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/about"
            className="gradient-ring glass inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_7%,transparent)] focus-visible:ring-3 focus-visible:ring-foreground/30"
          >
            More about me
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 flex items-center gap-2 text-muted-foreground"
        >
          {[
            { href: siteConfig.social.github, label: "GitHub", Icon: GitHubIcon },
            {
              href: siteConfig.social.linkedin,
              label: "LinkedIn",
              Icon: LinkedInIcon,
            },
            { href: siteConfig.social.twitter, label: "X (Twitter)", Icon: XIcon },
            {
              href: siteConfig.social.telegram,
              label: "Telegram",
              Icon: TelegramIcon,
            },
            { href: `mailto:${siteConfig.social.email}`, label: "Email", Icon: Mail },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer noopener"
              aria-label={label}
              className="gradient-ring flex size-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/8 hover:text-foreground"
            >
              <Icon className="size-[18px]" />
            </a>
          ))}
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
