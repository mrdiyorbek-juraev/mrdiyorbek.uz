import type { CommentNode } from "@/server/comments";

export type { CommentAuthor, CommentNode } from "@/server/comments";

/** The signed-in user, reduced to what the thread needs to render. */
export type Viewer = {
  id: string;
  name: string;
  avatarUrl: string | null;
} | null;

/** Depth-first count, used for the header and the empty state. */
export function countAll(nodes: CommentNode[]): number {
  return nodes.reduce((n, node) => n + 1 + countAll(node.replies), 0);
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
