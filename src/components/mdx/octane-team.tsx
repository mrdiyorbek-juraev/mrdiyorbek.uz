"use client";

import * as React from "react";
import Image from "next/image";
import { Globe, LayoutGrid, Rows3 } from "lucide-react";

import { octaneTeam, type TeamMember } from "@/lib/octane-team";
import { cn } from "@/lib/utils";
import {
  BlueskyIcon,
  GitHubIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons";

type View = "compact" | "cards";

/** Two letters from the name, for when someone has no avatar yet. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Socials({
  member,
  className,
}: {
  member: TeamMember;
  className?: string;
}) {
  const links = [
    { href: member.x, label: "X", Icon: XIcon },
    { href: member.bluesky, label: "Bluesky", Icon: BlueskyIcon },
    { href: member.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: member.github, label: "GitHub", Icon: GitHubIcon },
    { href: member.youtube, label: "YouTube", Icon: YouTubeIcon },
    { href: member.website, label: "Website", Icon: Globe },
  ].filter((l): l is { href: string; label: string; Icon: typeof XIcon } =>
    Boolean(l.href),
  );

  if (links.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${member.name} on ${label}`}
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon className="size-[18px]" />
        </a>
      ))}
    </div>
  );
}

function Avatar({ member, sizes }: { member: TeamMember; sizes: string }) {
  if (!member.avatar) {
    return (
      <div className="flex size-full items-center justify-center bg-muted text-xl font-semibold text-muted-foreground">
        {initials(member.name)}
      </div>
    );
  }
  return (
    <Image
      src={member.avatar}
      alt=""
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

/**
 * One tile in the compact grid.
 *
 * The whole tile is the link, so the target is the card rather than a small
 * name — but only when there is somewhere to go. GitHub is preferred; anyone
 * without one falls back to whatever they do have, and a member with no links
 * at all renders as plain markup instead of a dead anchor.
 */
function CompactCard({ member }: { member: TeamMember }) {
  const href =
    member.github ?? member.x ?? member.bluesky ?? member.linkedin ?? member.website;

  const inner = (
    <>
      {/* The scale has to sit on a wrapper around the image — the tile itself
          can't scale without taking the caption with it. motion-safe so the OS
          reduced-motion setting turns it off. */}
      <div className="absolute inset-0 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]">
        <Avatar
          member={member}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {href && (
        <span
          aria-hidden
          className="absolute top-2 right-2 rounded-full bg-black/55 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <GitHubIcon className="size-3.5" />
        </span>
      )}

      {/* Scrim so the name stays legible over any photo.
          span, not p — a <p> here inherits the article's paragraph margin and
          pushes the role away from the name. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-10">
        <span className="block text-sm leading-snug font-bold text-white">
          {member.name}
        </span>
        {member.role && (
          <span className="mt-px block text-[11px] leading-tight text-white/65">
            {member.role}
          </span>
        )}
      </div>
    </>
  );

  const shell = cn(
    "group relative block aspect-square overflow-hidden rounded-xl border border-border/60",
    "transition-all duration-300",
  );

  if (!href) return <div className={shell}>{inner}</div>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      // The name is inside, but it is decorative markup to a screen reader —
      // this says where the link actually goes.
      aria-label={`${member.name} on ${member.github ? "GitHub" : "the web"}`}
      className={cn(
        shell,
        "hover:border-primary/60 hover:shadow-lg hover:shadow-black/20",
        "motion-safe:hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {inner}
    </a>
  );
}

/**
 * The Octane core team, in two densities.
 *
 * `compact` is a dense grid with the name overlaid on the photo — good for
 * scanning a long list. `cards` gives each person room for social links.
 * No filtering: a fixed team of this size is faster to read than to filter.
 */
export function OctaneTeam({
  members = octaneTeam,
}: {
  members?: TeamMember[];
}) {
  const [view, setView] = React.useState<View>("compact");

  // An empty list renders nothing in production — a reader should never see a
  // note addressed to whoever maintains the file. The hint stays in dev so an
  // empty section is obvious while editing rather than silently blank.
  if (members.length === 0) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <p className="my-8 rounded-xl border border-dashed border-border/70 px-5 py-6 text-center text-sm text-muted-foreground">
        Team list is empty — add entries to{" "}
        <code className="font-mono text-xs">src/lib/octane-team.ts</code>.
      </p>
    );
  }

  return (
    <section className="my-8 not-prose">
      <div
        role="group"
        aria-label="Team layout"
        className="mb-5 inline-flex rounded-xl border border-border/70 p-1"
      >
        {(
          [
            { id: "compact", label: "Compact grid", Icon: LayoutGrid },
            { id: "cards", label: "Detailed cards", Icon: Rows3 },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            aria-label={label}
            onClick={() => setView(id)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              view === id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      {view === "compact" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => (
            <li key={member.name}>
              <CompactCard member={member} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.name} className="text-center">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60">
                <Avatar
                  member={member}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <span className="mt-3 block font-bold">{member.name}</span>
              {member.role && (
                <span className="block text-xs text-muted-foreground">
                  {member.role}
                </span>
              )}
              <Socials member={member} className="mt-2 justify-center" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
