import {
  SiCypress,
  SiDocker,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTurborepo,
  SiTypescript,
  SiVitest,
  SiVuedotjs,
} from "@icons-pack/react-simple-icons";

/**
 * Real brand marks from simple-icons rather than stand-in shapes — a generic
 * hexagon says nothing about which tools these actually are.
 */
const stack = [
  { label: "TypeScript", Icon: SiTypescript },
  { label: "React", Icon: SiReact },
  { label: "Next.js", Icon: SiNextdotjs },
  { label: "Vue", Icon: SiVuedotjs },
  { label: "Node.js", Icon: SiNodedotjs },
  { label: "Tailwind CSS", Icon: SiTailwindcss },
  { label: "Turborepo", Icon: SiTurborepo },
  { label: "Vitest", Icon: SiVitest },
  { label: "Cypress", Icon: SiCypress },
  { label: "Docker", Icon: SiDocker },
];

export function TechStack() {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {stack.map(({ label, Icon }) => (
        <li key={label}>
          <span
            title={label}
            className="group flex size-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/50 text-muted-foreground transition-colors hover:border-brand/40 hover:text-primary"
          >
            <Icon className="size-5" aria-hidden />
            <span className="sr-only">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
