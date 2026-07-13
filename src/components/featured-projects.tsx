import { projects } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { SectionHeading, MoreLink } from "@/components/section-heading";
import { ProjectPair } from "@/components/project-cards";

export function FeaturedProjects() {
  const featured = projects.slice(0, 2);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <Reveal>
        <SectionHeading
          lead="Featured"
          highlight="Projects"
          underline
          subtitle="A selection of projects that I've worked on."
          className="mb-10"
        />
      </Reveal>

      <div className="flex flex-col gap-4">
        {featured.map((project, i) => (
          <ProjectPair key={project.title} project={project} index={i} />
        ))}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <MoreLink href="/projects">See more projects</MoreLink>
      </Reveal>
    </section>
  );
}
