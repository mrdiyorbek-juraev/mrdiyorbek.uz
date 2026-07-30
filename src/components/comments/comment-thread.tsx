"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

import {
  MAX_COMMENT_DEPTH,
  authorFrom,
  buildTree,
  countComments,
  pruneDeleted,
  type CommentNode,
} from "@/server/comments";
import type { ContentKind } from "@/lib/api";
import { getBrowserClient } from "@/lib/supabase/client";
import { GitHubIcon, GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import type { Viewer } from "@/components/comments/types";

type Props = {
  kind: ContentKind;
  slug: string;
  /** Server-rendered, so the thread is in the HTML crawlers see. */
  initialComments: CommentNode[];
  ownerId?: string;
};

/** Flatten a tree back to a list so a change can be re-applied and re-nested. */
function flatten(nodes: CommentNode[]): CommentNode[] {
  return nodes.flatMap((n) => [
    { ...n, replies: [] },
    ...flatten(n.replies),
  ]);
}

export function CommentThread({
  kind,
  slug,
  initialComments,
  ownerId,
}: Props) {
  const [comments, setComments] = React.useState(initialComments);
  // Resolved on the client. The page cannot read cookies without giving up
  // static generation, so a signed-in reader sees the sign-in prompt for a
  // moment before the form replaces it.
  const [viewer, setViewer] = React.useState<Viewer>(null);
  // Counts living comments only — a tombstone kept to hold a thread together
  // is not something to advertise in the heading.
  const total = countComments(comments);

  const flatRef = React.useRef(flatten(initialComments));
  const router = useRouter();
  const refreshTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read inside the realtime handler. Depending on `viewer` directly would
  // tear down and re-subscribe the channel on every sign-in or sign-out.
  const viewerIdRef = React.useRef<string | null>(null);

  React.useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  const rebuild = React.useCallback(() => {
    // Clone so buildTree isn't pushing into last render's arrays. Prune with
    // the same rule the server uses, or a comment deleted in this session
    // would linger as a tombstone until reload.
    const fresh = flatRef.current.map((n) => ({ ...n, replies: [] }));
    setComments(pruneDeleted(buildTree(fresh)));
  }, []);

  const upsert = React.useCallback(
    (node: CommentNode) => {
      const i = flatRef.current.findIndex((n) => n.id === node.id);
      if (i >= 0) flatRef.current[i] = node;
      else flatRef.current.push(node);
      flatRef.current.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      rebuild();
    },
    [rebuild],
  );

  // Resolve the session, then track sign-in/sign-out without a page reload.
  // onAuthStateChange emits INITIAL_SESSION on subscribe, so this covers both
  // the first read and every later change.
  React.useEffect(() => {
    const db = getBrowserClient();
    if (!db) return;

    const { data } = db.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      viewerIdRef.current = user?.id ?? null;
      setViewer(user ? authorFrom(user.id, user.user_metadata) : null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // Live thread. postgres_changes rather than broadcast here, unlike the like
  // counter: a comment has to be durably stored before anyone should see it,
  // so riding the WAL costs nothing and cannot be forged by a client.
  React.useEffect(() => {
    const db = getBrowserClient();
    if (!db) return;

    const channel = db
      .channel(`comments:${kind}:${slug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          // One condition only, so filter on slug and check kind below.
          filter: `slug=eq.${slug}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown> | null;
          if (!row || row.kind !== kind) return;

          const id = String(row.id);
          const existing = flatRef.current.find((n) => n.id === id);
          const authorId = String(row.author_id);

          // The WAL row carries author_id but no profile, and only the server
          // can turn one into a name and avatar. If this is someone we haven't
          // seen, ask the server component to re-render rather than leaving
          // "Anonymous" on screen. Debounced so a burst is one refresh.
          if (!existing && authorId !== viewerIdRef.current) {
            if (refreshTimer.current) clearTimeout(refreshTimer.current);
            refreshTimer.current = setTimeout(() => router.refresh(), 1200);
          }

          upsert({
            id,
            parentId: (row.parent_id as string | null) ?? null,
            depth: Number(row.depth ?? 0),
            body: row.deleted_at ? "" : String(row.body ?? ""),
            createdAt: String(row.created_at),
            editedAt: (row.edited_at as string | null) ?? null,
            deleted: Boolean(row.deleted_at),
            // The realtime row carries author_id but no profile — reuse what we
            // already have, and fall back to a placeholder for a stranger's
            // first comment until the next server render fills it in.
            author:
              existing?.author ??
              authorFrom(String(row.author_id), null),
            replies: [],
          });
        },
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [kind, slug, upsert, router]);

  async function signIn(provider: "github" | "google") {
    const db = getBrowserClient();
    if (!db) {
      toast.error("Comments aren't configured yet.");
      return;
    }

    const { error } = await db.auth.signInWithOAuth({
      provider,
      options: {
        // Come back to the post being read, not the site root.
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          window.location.pathname,
        )}`,
      },
    });

    // Surfaces a disabled provider instead of failing silently at the redirect.
    if (error) toast.error(error.message);
  }

  async function signOut() {
    const db = getBrowserClient();
    if (!db) return;
    // Clears the client session; onAuthStateChange swaps the form back to the
    // sign-in prompt without a reload.
    await db.auth.signOut();
  }

  async function post(parentId: string | null, body: string) {
    const db = getBrowserClient();
    if (!db || !viewer) return false;

    const { data, error } = await db
      .from("comments")
      .insert({ kind, slug, parent_id: parentId, body, author_id: viewer.id })
      .select("id, parent_id, depth, body, created_at, edited_at, deleted_at")
      .single();

    if (error || !data) {
      toast.error(
        error?.message.includes("rate limit")
          ? "You're commenting a bit fast — try again in a few minutes."
          : "Couldn't post that comment.",
      );
      return false;
    }

    upsert({
      id: String(data.id),
      parentId: data.parent_id ?? null,
      depth: Number(data.depth ?? 0),
      body: String(data.body),
      createdAt: String(data.created_at),
      editedAt: null,
      deleted: false,
      author: { id: viewer.id, name: viewer.name, avatarUrl: viewer.avatarUrl },
      replies: [],
    });
    return true;
  }

  async function remove(id: string) {
    const db = getBrowserClient();
    if (!db) return false;

    // Soft delete, so replies underneath survive.
    const { error } = await db
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Couldn't delete that comment.");
      return false;
    }

    const node = flatRef.current.find((n) => n.id === id);
    if (node) upsert({ ...node, body: "", deleted: true });
    return true;
  }

  return (
    <section aria-labelledby="comments-heading" className="scroll-mt-24">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 id="comments-heading" className="text-xl font-semibold tracking-tight">
          {total === 0
            ? "Comments"
            : `${total} ${total === 1 ? "comment" : "comments"}`}
        </h2>
      </div>

      <div className="mt-5">
        {viewer ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Commenting as{" "}
                <span className="font-medium text-foreground">
                  {viewer.name}
                </span>
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => void signOut()}
                className="text-muted-foreground"
              >
                Sign out
              </Button>
            </div>
            <CommentForm viewer={viewer} onSubmit={(body) => post(null, body)} />
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Sign in to join the discussion.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void signIn("github")} variant="outline">
                <GitHubIcon className="size-4" />
                GitHub
              </Button>
              <Button onClick={() => void signIn("google")} variant="outline">
                <GoogleIcon className="size-4" />
                Google
              </Button>
            </div>
          </div>
        )}
      </div>

      {comments.length > 0 && (
        <>
          <Separator className="my-6" />
          <div>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                viewer={viewer}
                ownerId={ownerId}
                onReply={(parentId, body) => post(parentId, body)}
                onDelete={remove}
              />
            ))}
          </div>
        </>
      )}

      {comments.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first.
        </p>
      )}

      {/* Only surfaced once someone is actually deep enough to hit it. */}
      {total > 0 && (
        <p className="sr-only">
          Replies nest up to {MAX_COMMENT_DEPTH} levels.
        </p>
      )}
    </section>
  );
}
