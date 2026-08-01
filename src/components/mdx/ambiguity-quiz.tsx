"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Option = { label: string; response: string };

/**
 * A sentence with two valid readings, and a reveal.
 *
 * The point is participatory: the reader has to commit to one reading before
 * being told a second existed. Static prose can assert that ambiguity is
 * invisible; only an interaction can demonstrate it on the reader themselves.
 */
/**
 * Props are flat strings on purpose.
 *
 * This MDX pipeline silently drops expression attributes — `flags={[...]}`
 * arrives as undefined while `flags="..."` arrives intact — so anything a post
 * passes has to be a plain string. The quiz only ever needs two readings,
 * which is the whole shape of a binary ambiguity.
 */
export function AmbiguityQuiz({
  prompt,
  sentence,
  optionA,
  responseA,
  optionB,
  responseB,
}: {
  prompt: string;
  sentence: string;
  optionA: string;
  responseA: string;
  optionB: string;
  responseB: string;
}) {
  const [picked, setPicked] = React.useState<number | null>(null);

  const options: Option[] = [
    { label: optionA, response: responseA },
    { label: optionB, response: responseB },
  ];

  return (
    <div className="my-8 rounded-2xl border-2 border-foreground/80 bg-card/60 p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {prompt}
      </p>

      <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
        &ldquo;{sentence}&rdquo;
      </p>

      <div
        role="group"
        aria-label={prompt}
        className="mt-5 flex flex-col gap-2 sm:flex-row"
      >
        {options.map((option, i) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
            className={cn(
              "flex-1 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              picked === i
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-background hover:border-foreground/60",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* aria-live so the reveal is announced rather than silently appearing. */}
      <div aria-live="polite">
        {picked !== null && (
          <p className="mt-5 border-t border-border/70 pt-4 text-[0.97rem] leading-relaxed text-muted-foreground">
            {options[picked].response}
          </p>
        )}
      </div>
    </div>
  );
}
