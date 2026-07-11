import Link from "next/link";
import { Eye } from "lucide-react";

import type { Note } from "@/lib/shorts";
import { formatNumber } from "@/lib/utils";

export function NoteCard({ note }: { note: Note }) {
  return (
    <Link
      href={`/shorts/${note.slug}`}
      className="group relative flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:rotate-[-1deg] hover:border-foreground/70 hover:bg-card/70 hover:shadow-2xl hover:shadow-black/40"
    >
      {/* Folded corner */}
      <span className="absolute bottom-0 right-0 size-0 border-l-[18px] border-t-[18px] border-l-transparent border-t-transparent opacity-0 transition-opacity duration-300 group-hover:border-t-secondary group-hover:opacity-100 [border-bottom-right-radius:2px]" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-muted-foreground transition-colors group-hover:text-foreground group-hover:underline group-hover:decoration-foreground/40 group-hover:underline-offset-4">
          {note.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="size-4 text-primary" />
          {formatNumber(note.views)} views
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border/50 pt-4">
        {note.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground/70">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
