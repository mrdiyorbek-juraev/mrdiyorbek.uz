import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";

import { projects } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { ProjectPair } from "@/components/project-cards";

export const metadata: Metadata = {
  alternates: { canonical: "/projects" },
  title: "Projects",
  description: "Showcase of my projects that I'm proud of.",
};

export default function ProjectsPage() {
  return (
    <div className="pb-24">
      {/* Blueprint header */}
      <header className="relative overflow-hidden pb-16 pt-32 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-grid opacity-[0.15]" />
          <svg
            aria-hidden
            viewBox="0 0 600 300"
            className="h-72 w-full max-w-4xl text-foreground/[0.06] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_45%,#000,transparent_75%)]"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="150" cy="150" r="90" strokeWidth="1" />
            <circle cx="150" cy="150" r="50" strokeWidth="1" />
            <circle cx="450" cy="150" r="70" strokeWidth="1" />
            <path d="M150 40v220M40 150h220" strokeWidth="1" />
            <path d="M380 150h140M450 80v140" strokeWidth="1" strokeDasharray="4 6" />
          </svg>
        </div>

        <Reveal className="flex flex-col items-center">
          <span className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground">
            <FolderOpen className="size-5" />
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Curated <span className="text-primary">Projects</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Showcase of my projects that I&apos;m proud of.
          </p>
        </Reveal>
      </header>

      {/* Project list */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6">
        {projects.map((project, i) => (
          <ProjectPair key={project.title} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
