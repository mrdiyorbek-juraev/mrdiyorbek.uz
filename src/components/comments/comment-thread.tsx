"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

import {
  MAX_COMMENT_DEPTH,
  authorFrom,
  countComments,
  type CommentNode,
} from "@/server/comments";
import {
  useComments,
  useDeleteComment,
  useEditComment,
  usePostComment,
  useRefreshComments,
} from "@/hooks/use-comments";
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

export function CommentThread({
  kind,
  slug,
  initialComments,
  ownerId,
}: Props) {
  // Server render seeds the cache; React Query refetches on mount because the
  // page is ISR-cached for 300s and its embedded copy is usually stale.
  const { data: comments = [] } = useComments(kind, slug, initialComments);
  const refresh = useRefreshComments(kind, slug);

  // Resolved on the client. The page cannot read cookies without giving up
  // static generation, so a signed-in reader sees the sign-in prompt for a
  // moment before the form replaces it.
  const [viewer, setViewer] = React.useState<Viewer>(null);
  // Counts living comments only — a tombstone kept to hold a thread together
  // is not something to advertise in the heading.
  const total = countComments(comments);

  const postComment = usePostComment(kind, slug, viewer);
  const deleteComment = useDeleteComment(kind, slug);
  const editComment = useEditComment(kind, slug);

  React.useEffect(() => {
    const db = getBrowserClient();
    if (!db) return;

    db.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setViewer(user ? authorFrom(user.id, user.user_metadata) : null);
    });

    const { data: sub } = db.auth.onAuthStateChange((_e, session) => {
      const user = session?.user;
      setViewer(user ? authorFrom(user.id, user.user_metadata) : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Someone else commented: let the query refetch rather than patching the
  // tree by hand. depth is derived by a trigger and the author needs a profile
  // lookup, so the server's shape is the only one worth trusting.
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
          filter: `slug=eq.${slug}`,
        },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [kind, slug, refresh]);

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
    await db.auth.signOut();
  }

  async function post(parentId: string | null, body: string) {
    try {
      await postComment.mutateAsync({ parentId, body });
      return true;
    } catch {
      return false; // the mutation already surfaced a toast
    }
  }

  async function remove(id: string) {
    try {
      await deleteComment.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  }

  async function edit(id: string, body: string) {
    try {
      await editComment.mutateAsync({ id, body });
      return true;
    } catch {
      return false;
    }
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
                onEdit={edit}
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
