"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(
  () => import("./video-player").then((m) => m.VideoPlayer),
  {
    // No server render: the player reads the DOM and the media element's own
    // state on mount, and there is nothing useful it could emit as static HTML.
    // The poster in video-frame.tsx is what fills the frame in the meantime,
    // and that one *is* server-rendered.
    ssr: false,
  },
);

/**
 * Loads the player when the frame comes near the viewport.
 *
 * Mounting on scroll rather than on click is deliberate. A click-to-load
 * facade would have to call `play()` after an async chunk download, by which
 * point the browser's user-activation window has usually expired and the play
 * silently fails. Mounting early means the reader's click lands on the real
 * player and counts as a direct gesture.
 */
export function VideoMount({
  src,
  poster,
  placeholder,
}: {
  src: string;
  poster?: string;
  placeholder?: string;
}) {
  const [mounted, setMounted] = React.useState(false);

  // A ref callback rather than an effect. React 19 runs the returned function
  // as the ref's cleanup, which gives the same attach/detach pairing an effect
  // would — without the render-time state write that `useEffect` + `setState`
  // introduces, and without needing the element in a ref first.
  const observe = React.useCallback((el: HTMLDivElement | null) => {
    if (!el) return;

    // No feature test for IntersectionObserver. It has been in every browser
    // since 2019; this skin's stylesheet needs relative-colour `oklch(from …)`
    // and container queries, which are years newer. A browser that could miss
    // the observer could not paint the player anyway.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setMounted(true);
        observer.disconnect();
      },
      // Roughly a screen of runway, so the chunk is in place before the frame
      // is actually looked at.
      { rootMargin: "400px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={observe} className="absolute inset-0">
      {mounted && (
        <VideoPlayer src={src} poster={poster} placeholder={placeholder} />
      )}
    </div>
  );
}
