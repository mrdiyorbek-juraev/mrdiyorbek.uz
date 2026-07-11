import { Atom, Braces, Wind, Boxes, Hexagon, Database } from "lucide-react";

const stack = [
  { label: "Next.js", Icon: Boxes },
  { label: "React", Icon: Atom },
  { label: "TypeScript", Icon: Braces },
  { label: "Tailwind CSS", Icon: Wind },
  { label: "Node.js", Icon: Hexagon },
  { label: "Prisma", Icon: Database },
];

export function TechStack() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {stack.map(({ label, Icon }) => (
        <span
          key={label}
          title={label}
          className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/50 text-muted-foreground transition-colors hover:border-brand/40 hover:text-primary"
        >
          <Icon className="size-5" />
        </span>
      ))}
    </div>
  );
}
