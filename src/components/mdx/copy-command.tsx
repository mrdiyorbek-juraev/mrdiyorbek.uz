"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

/** A shell command with a copy button — the one thing readers always want. */
export function CopyCommand({
  command,
  label = "Terminal",
}: {
  command: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Denied permission, or a non-secure origin. Say so rather than
      // pretending it worked.
      toast.error("Couldn't copy — select the text instead.");
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/70 bg-muted/40">
      <div className="border-b border-border/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <code className="flex-1 overflow-x-auto font-mono text-[13px] leading-relaxed">
          {command}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label={copied ? "Copied" : "Copy command"}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
