import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { VideoMount } from "./video-mount";

/**
 * A captioned video for an article.
 *
 * A server component on purpose: the frame, the poster and the caption are in
 * the server HTML, so the layout is settled and the poster is already
 * downloading before any JavaScript runs. Only the player itself is a client
 * island, and it is lazy — see video-mount.tsx.
 *
 * Every prop is a plain string. This MDX pipeline silently drops expression
 * attributes (`aspect={16 / 9}` arrives as undefined), so `aspect="16/9"` is
 * not a style choice, it is the only form that survives.
 *
 * ```mdx
 * <VideoFrame
 *   src="/blog/octane-demo.mp4"
 *   poster="/blog/octane-demo.jpg"
 *   caption="Octane renderer sinovi"
 * />
 * ```
 */
export function VideoFrame({
  src,
  poster,
  placeholder,
  caption,
  aspect = "16/9",
  className,
  children,
}: {
  /** File or stream URL — anything an HTML `<video>` accepts. */
  src: string;
  /** Still frame shown before playback. Also the server-rendered fill. */
  poster?: string;
  /** Tiny image blurred behind the poster while it loads. */
  placeholder?: string;
  /** Plain-text caption. Children win if both are given. */
  caption?: string;
  /** Any CSS `aspect-ratio` value, e.g. `"16/9"`, `"4/3"`, `"9/16"`. */
  aspect?: string;
  className?: string;
  /** Caption as MDX, when it needs a link or emphasis. */
  children?: ReactNode;
}) {
  const label = children ?? caption;

  return (
    <figure className={cn("not-prose my-8", className)}>
      <div
        // aspect-ratio inline rather than a Tailwind class: Tailwind generates
        // CSS by scanning source text, so `aspect-[${aspect}]` would compile to
        // nothing at all. Black because that is what a letterboxed video
        // should sit on, in every theme.
        style={{ aspectRatio: aspect } as CSSProperties}
        className="relative w-full overflow-hidden rounded-xl border border-border/70 bg-black"
      >
        {poster && (
          // Deliberately not next/image: a poster can live on any CDN a post
          // happens to use, and next/image would reject each new host until
          // next.config.ts learned about it. Decorative — the player renders
          // its own poster on top, and the caption carries the meaning.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            // object-contain, matching the player's own default, so the image
            // does not visibly reframe at the moment the player mounts.
            className="absolute inset-0 size-full object-contain"
          />
        )}

        <VideoMount src={src} poster={poster} placeholder={placeholder} />
      </div>

      {label && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
