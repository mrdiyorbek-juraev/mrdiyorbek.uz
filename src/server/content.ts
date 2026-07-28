import { getAllSlugs } from "@/lib/blog";
import { notes } from "@/lib/shorts";
import type { ContentKind } from "@/server/stats";

/**
 * Guards the API against writes for slugs that don't exist — otherwise anyone
 * could spray arbitrary rows into the counter tables.
 *
 * Cached in production only, so newly added MDX shows up in dev without a
 * restart.
 */
let cache: Record<ContentKind, Set<string>> | null = null;

function slugSets() {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = {
    blog: new Set(getAllSlugs()),
    short: new Set(notes.map((note) => note.slug)),
  };
  return cache;
}

export function contentExists(kind: ContentKind, slug: string): boolean {
  return slugSets()[kind].has(slug);
}
