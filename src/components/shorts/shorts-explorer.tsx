"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, StickyNote, ArrowDownUp, ChevronsUpDown, Check } from "lucide-react";

import type { NoteWithStats } from "@/lib/shorts";
import { cn } from "@/lib/utils";
import { NoteCard } from "@/components/shorts/note-card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortKey = "az" | "za" | "views" | "likes";

const sortLabels: Record<SortKey, string> = {
  az: "Sort A to Z",
  za: "Sort Z to A",
  views: "Most viewed",
  likes: "Most liked",
};

export function ShortsExplorer({ notes }: { notes: NoteWithStats[] }) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<SortKey>("az");
  const searchRef = React.useRef<HTMLInputElement>(null);

  const topics = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes)
      for (const t of n.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
  }, [notes]);

  const toggleTopic = (t: string) =>
    setActive((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = notes.filter((n) => {
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTopics =
        active.length === 0 || active.some((t) => n.tags.includes(t));
      return matchesQuery && matchesTopics;
    });
    result.sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      if (sort === "likes") return b.likes - a.likes;
      const cmp = a.title.localeCompare(b.title);
      return sort === "za" ? -cmp : cmp;
    });
    return result;
  }, [notes, query, active, sort]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.shiftKey && (e.key === "S" || e.key === "s") && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground">
          <StickyNote className="size-5" />
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-primary">Short</span> Notes
        </h1>
        <p className="mt-3 text-muted-foreground">
          My personal notes that&apos;s not long enough to be a blog post.
        </p>

        <div className="relative mt-6 w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-12 rounded-xl bg-card/50 pl-11 pr-20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground">
            <kbd className="rounded border border-border/70 bg-secondary/60 px-1.5 py-0.5">
              Shift
            </kbd>
            <kbd className="rounded border border-border/70 bg-secondary/60 px-1.5 py-0.5">
              S
            </kbd>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_16rem]">
        <div className="min-w-0">
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((note) => (
                <motion.div
                  key={note.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NoteCard note={note} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
              No notes match your search.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 text-sm transition-colors hover:border-brand/40">
              <span className="inline-flex items-center gap-2">
                <ArrowDownUp className="size-4 text-muted-foreground" />
                {sortLabels[sort]}
              </span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(v) => setSort(v as SortKey)}
              >
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {sortLabels[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">Choose topics</h2>
              {active.length > 0 && (
                <button
                  onClick={() => setActive([])}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Check className="size-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const on = active.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs transition-colors",
                      on
                        ? "border-brand/50 bg-brand/10 text-primary"
                        : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
