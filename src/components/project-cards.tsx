import { GitBranch, Link2 } from "lucide-react";

import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { MoreLink } from "@/components/section-heading";

export function ProjectImageCard({
  title,
  accent,
  className,
}: {
  title: string;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-52 items-center justify-center overflow-hidden rounded-3xl border border-border/60",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", accent)} />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <span className="pointer-events-none select-none whitespace-nowrap text-6xl font-bold text-foreground/[0.06]">
        {title}
      </span>
    </div>
  );
}

export function ProjectTextCard({ project }: { project: Project }) {
  const hasLinks = project.repo || project.live;
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-card/40 p-7">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-3 max-w-md text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Tools:</span>
          {project.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-md border border-border/60 bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <MoreLink href={project.href}>View Project</MoreLink>
        {hasLinks && (
          <div className="flex items-center gap-5">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <GitBranch className="size-4" /> Repository
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Link2 className="size-4" /> Open Live Site
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** One project rendered as an alternating text + image pair (two grid cells). */
export function ProjectPair({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reversed = index % 2 === 1;
  const text = (
    <Reveal>
      <ProjectTextCard project={project} />
    </Reveal>
  );
  const image = (
    <Reveal delay={0.08}>
      <ProjectImageCard
        title={project.title}
        accent={project.accent}
        className="h-full"
      />
    </Reveal>
  );
  return (
    <>
      {reversed ? image : text}
      {reversed ? text : image}
    </>
  );
}
