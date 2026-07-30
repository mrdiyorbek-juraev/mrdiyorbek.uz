"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getBrowserClient } from "@/lib/supabase/client";
import {
  authorFrom,
  buildTree,
  pruneDeleted,
  type CommentAuthor,
  type CommentNode,
} from "@/server/comments";
import type { ContentKind } from "@/lib/api";

export const commentsKey = (kind: ContentKind, slug: string) =>
  ["comments", kind, slug] as const;

type Row = {
  id: string;
  parent_id: string | null;
  depth: number;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  author_id: string;
};

/**
 * Read the thread straight from Postgres.
 *
 * Both `comments` and `profiles` are publicly readable, so this needs no API
 * route — and going direct skips the Vercel hop measured at
 * hkg1 → iad1 → Sydney, which is the same reasoning that put writes on this
 * path. Two round trips rather than one embed, because comments.author_id
 * references auth.users rather than profiles, so PostgREST has no relationship
 * to follow.
 */
export async function fetchComments(
  kind: ContentKind,
  slug: string,
): Promise<CommentNode[]> {
  const db = getBrowserClient();
  if (!db) return [];

  const { data, error } = await db
    .from("comments")
    .select(
      "id, parent_id, depth, body, created_at, edited_at, deleted_at, author_id",
    )
    .eq("kind", kind)
    .eq("slug", slug)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((r) => r.author_id))];
  const authors = new Map<string, CommentAuthor>();

  const { data: profiles } = await db
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", ids);

  for (const p of (profiles ?? []) as {
    id: string;
    name: string | null;
    avatar_url: string | null;
  }[]) {
    authors.set(p.id, {
      id: p.id,
      name: p.name ?? "Anonymous",
      avatarUrl: p.avatar_url,
    });
  }

  const nodes: CommentNode[] = rows.map((row) => ({
    id: row.id,
    parentId: row.parent_id,
    depth: row.depth,
    // Mirrors the server: a deleted row survives to hold the thread together,
    // but its text must never reach the client.
    body: row.deleted_at ? "" : row.body,
    createdAt: row.created_at,
    editedAt: row.edited_at,
    deleted: Boolean(row.deleted_at),
    author: authors.get(row.author_id) ?? authorFrom(row.author_id, null),
    replies: [],
  }));

  return pruneDeleted(buildTree(nodes));
}

/**
 * The thread, seeded from the server render and corrected on mount.
 *
 * `initialData` keeps the comments in the server HTML — good for SEO and it
 * avoids an empty flash — while `staleTime: 0` means React Query refetches
 * immediately. That combination is the whole point: the post page is ISR-cached
 * for 300s, so the embedded copy can be minutes old, and a reload used to show
 * a snapshot from before the reader's own comment.
 */
export function useComments(
  kind: ContentKind,
  slug: string,
  initialData: CommentNode[],
) {
  return useQuery({
    queryKey: commentsKey(kind, slug),
    queryFn: () => fetchComments(kind, slug),
    initialData,
    // Treat the server copy as already stale — it usually is.
    initialDataUpdatedAt: 0,
  });
}

/** Push a freshly-read tree into the cache; used by the realtime subscription. */
export function useRefreshComments(kind: ContentKind, slug: string) {
  const qc = useQueryClient();
  return React.useCallback(
    () => qc.invalidateQueries({ queryKey: commentsKey(kind, slug) }),
    [qc, kind, slug],
  );
}

export function usePostComment(
  kind: ContentKind,
  slug: string,
  viewer: CommentAuthor | null,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      body,
    }: {
      parentId: string | null;
      body: string;
    }) => {
      const db = getBrowserClient();
      if (!db) throw new Error("Comments aren't configured yet.");
      if (!viewer) throw new Error("Sign in to comment.");

      const { data, error } = await db
        .from("comments")
        .insert({
          kind,
          slug,
          parent_id: parentId,
          body: body.trim(),
          author_id: viewer.id,
        })
        .select("id")
        .single();

      if (error) {
        // The rate limit is a check-constraint violation raised by the insert
        // trigger; surface it as advice rather than a database error.
        throw new Error(
          error.message.includes("rate limit")
            ? "You're commenting a bit fast — try again in a few minutes."
            : "Couldn't post that comment.",
        );
      }
      return data;
    },

    // Refetch rather than hand-patching the tree: depth is derived by a
    // trigger, so the server's shape is the only authoritative one.
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(kind, slug) }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteComment(kind: ContentKind, slug: string) {
  const qc = useQueryClient();
  const key = commentsKey(kind, slug);

  return useMutation({
    mutationFn: async (id: string) => {
      const db = getBrowserClient();
      if (!db) throw new Error("Comments aren't configured yet.");

      const { error } = await db
        .from("comments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw new Error("Couldn't delete that comment.");
    },

    // Optimistic: deletion is the one action where waiting on a ~1.5s round
    // trip feels broken.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CommentNode[]>(key);

      qc.setQueryData<CommentNode[]>(key, (old) =>
        old ? pruneDeleted(markDeleted(old, id)) : old,
      );

      return { previous };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      toast.error(e.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

/** Immutably mark one node deleted, preserving the rest of the tree. */
function markDeleted(nodes: CommentNode[], id: string): CommentNode[] {
  return nodes.map((node) =>
    node.id === id
      ? { ...node, deleted: true, body: "", replies: markDeleted(node.replies, id) }
      : { ...node, replies: markDeleted(node.replies, id) },
  );
}

export type { QueryClient };
