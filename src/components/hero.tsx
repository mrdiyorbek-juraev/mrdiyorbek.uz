"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Mail, Atom, Braces, Boxes, Sparkles, Zap } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { GitHubIcon, XIcon } from "@/components/icons";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Hero() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92vh] items-center overflow-hidden"
    >
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-70" />
        <div className="absolute left-1/2 top-1/3 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-28 lg:grid-cols-2 lg:pt-24">
        {/* Left: copy */}
        <motion.div
          style={{ y: textY }}
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3.5 py-1.5 text-sm text-foreground/90 brand-glow">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/70" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              {siteConfig.status}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-5xl font-bold tracking-tight text-gradient sm:text-6xl"
          >
            I&apos;m {siteConfig.name}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 text-lg leading-relaxed text-muted-foreground"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/blog">
                Learn How <ArrowDown className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/about">More about me</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-8 flex items-center gap-3 text-muted-foreground"
          >
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="transition-colors hover:text-primary"
            >
              <GitHubIcon className="size-5" />
            </a>
            <a
              href={siteConfig.social.twitter}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X (Twitter)"
              className="transition-colors hover:text-primary"
            >
              <XIcon className="size-5" />
            </a>
            <a
              href={`mailto:${siteConfig.social.email}`}
              aria-label="Email"
              className="transition-colors hover:text-primary"
            >
              <Mail className="size-5" />
            </a>
          </motion.div>
        </motion.div>

        {/* Right: isometric visual */}
        <motion.div
          style={{ y: visualY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.15 }}
          className="relative hidden h-[26rem] lg:block"
          aria-hidden
        >
          <IsometricVisual />
        </motion.div>
      </div>
    </section>
  );
}

const tiles = [
  { Icon: Atom, x: "10%", y: "18%", d: 0 },
  { Icon: Braces, x: "58%", y: "6%", d: 0.4 },
  { Icon: Boxes, x: "70%", y: "48%", d: 0.8 },
  { Icon: Zap, x: "22%", y: "56%", d: 1.2 },
  { Icon: Sparkles, x: "42%", y: "30%", d: 0.6 },
];

function IsometricVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
      <div className="relative size-[24rem] [transform:rotateX(52deg)_rotateZ(-42deg)] [transform-style:preserve-3d]">
        {/* Platform */}
        <div className="absolute inset-0 rounded-[2rem] border border-brand/20 bg-card/40 bg-grid shadow-2xl shadow-black/40" />
        <div className="absolute inset-6 rounded-3xl border border-border/50" />

        {/* Floating icon tiles */}
        {tiles.map(({ Icon, x, y, d }, i) => (
          <motion.div
            key={i}
            className="absolute flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-secondary/80 text-primary shadow-xl shadow-black/40 backdrop-blur"
            style={{ left: x, top: y }}
            initial={{ z: 60 }}
            animate={reduce ? { z: 60 } : { z: [60, 96, 60] }}
            transition={{
              duration: 3.6,
              delay: d,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="size-7" />
          </motion.div>
        ))}

        {/* hello world tag */}
        <div
          className="absolute left-[4%] top-[70%] rounded-lg border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-medium text-primary"
          style={{ transform: "translateZ(80px)" }}
        >
          hello world
        </div>
      </div>
    </div>
  );
}
