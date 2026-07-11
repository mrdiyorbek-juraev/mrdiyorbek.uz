import { User } from "lucide-react";

import { siteConfig } from "@/lib/site";

export function Polaroid() {
  return (
    <div className="relative mx-auto w-fit">
      {/* Hand-drawn arrow */}
      <svg
        aria-hidden
        viewBox="0 0 90 60"
        className="absolute -left-16 top-24 hidden h-14 w-20 text-muted-foreground/60 lg:block"
        fill="none"
      >
        <path
          d="M4 8C10 34 34 44 78 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />
        <path
          d="M78 40l-11-3M78 40l-6 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Stacked frames */}
      <div className="absolute inset-0 -rotate-6 rounded-sm bg-neutral-900 shadow-xl shadow-black/40" />
      <div className="absolute inset-0 rotate-3 rounded-sm bg-neutral-900 shadow-xl shadow-black/40" />

      {/* Front polaroid */}
      <div className="relative -rotate-2 rounded-sm bg-neutral-950 p-3 pb-10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
        <div className="relative flex h-72 w-60 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900/40 via-neutral-800 to-neutral-900">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <User className="size-20 text-white/20" />
        </div>
        <p className="absolute bottom-2 left-0 right-0 text-center font-serif text-xl italic text-white/80">
          {siteConfig.author}
        </p>
      </div>
    </div>
  );
}
