import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

import { notes } from "@/lib/shorts";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mdx } from "@/components/mdx";
import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ slug: string }> };

function getNote(slug: string) {
  return notes.find((n) => n.slug === slug) ?? null;
}

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return { title: note.title };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <PageShell className="space-y-8">
      <Link
        href="/shorts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to notes
      </Link>

      <header className="space-y-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="size-4 text-primary" />
          {formatNumber(note.views)} views
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {note.title}
        </h1>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <Separator />

      <Mdx source={note.content} />
    </PageShell>
  );
}
