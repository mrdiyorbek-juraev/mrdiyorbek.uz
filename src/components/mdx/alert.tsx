import type { ReactNode } from "react";
import {
  CheckCircle2,
  Info,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "note" | "warning" | "success" | "tip";

/**
 * Fixed semantic colours rather than the brand token: an alert's colour is
 * carrying meaning, so it must not shift when the brand does. Each pair is
 * tuned per theme — a 500-weight text colour that reads on white is too dark
 * on the near-black background, and vice versa.
 */
const VARIANTS: Record<
  Variant,
  { Icon: LucideIcon; rail: string; tint: string; icon: string; label: string }
> = {
  note: {
    Icon: Info,
    rail: "border-blue-500/70",
    tint: "bg-blue-500/[0.07]",
    icon: "border-blue-500/70 text-blue-600 dark:text-blue-400",
    label: "Note",
  },
  warning: {
    Icon: TriangleAlert,
    rail: "border-amber-500/70",
    tint: "bg-amber-500/[0.07]",
    icon: "border-amber-500/70 text-amber-600 dark:text-amber-400",
    label: "Warning",
  },
  success: {
    Icon: CheckCircle2,
    rail: "border-emerald-500/70",
    tint: "bg-emerald-500/[0.07]",
    icon: "border-emerald-500/70 text-emerald-600 dark:text-emerald-400",
    label: "Success",
  },
  tip: {
    Icon: Lightbulb,
    rail: "border-violet-500/70",
    tint: "bg-violet-500/[0.07]",
    icon: "border-violet-500/70 text-violet-600 dark:text-violet-400",
    label: "Tip",
  },
};

/**
 * Callout with a hanging icon and a rail that curves into it.
 *
 * The rail is one element with `border-l border-t` and a rounded top-left
 * corner — a vertical line whose top bends right. No SVG, so it scales with
 * the text and inherits colour cleanly.
 *
 * `variant` and `title` are plain strings because this MDX pipeline drops
 * expression attributes.
 */
export function Alert({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const v = VARIANTS[variant] ?? VARIANTS.note;
  const { Icon } = v;

  return (
    <div className="not-prose relative my-8 pl-6 sm:pl-8">
      {/* The rail. Starts level with the icon's middle and runs to the bottom;
          the rounded top-left corner is the curve in one declaration. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-3 bottom-0 left-3 w-4 rounded-tl-xl border-t border-l-2",
          v.rail,
        )}
      />

      {/* Sits on the rail's start, with a background ring so the line appears
          to stop at the circle rather than run under it. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0 left-0 grid size-7 place-items-center rounded-full border-2 bg-background",
          v.icon,
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className={cn("rounded-2xl px-5 py-4", v.tint)}>
        {/* Always announced, even when no title is given — otherwise the
            colour is the only thing carrying the severity, which is invisible
            to a screen reader and to anyone who can't distinguish the hues. */}
        <span className="sr-only">{title ?? v.label}: </span>

        {title && (
          <p aria-hidden className="mb-2 font-semibold">
            {title}
          </p>
        )}

        <div className="space-y-3 text-[0.97rem] leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
