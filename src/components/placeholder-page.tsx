import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageShell } from "@/components/page-shell";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <PageShell>
      <div className="flex min-h-[40vh] flex-col items-start justify-center gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-medium text-primary">
          Coming soon
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">{description}</p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>
      </div>
    </PageShell>
  );
}
