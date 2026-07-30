"use client";

import * as React from "react";
import { Pencil, Reply, Trash2 } from "lucide-react";

import { MAX_COMMENT_DEPTH, type CommentNode } from "@/server/comments";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/comments/comment-form";
import { initials, type Viewer } from "@/components/comments/types";

type Props = {
  comment: CommentNode;
  viewer: Viewer;
  /** The post author's user id, so their comments can be badged. */
  ownerId?: string;
  onReply: (parentId: string, body: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (id: string, body: string) => Promise<boolean>;
};

export function CommentItem({
  comment,
  viewer,
  ownerId,
  onReply,
  onDelete,
  onEdit,
}: Props) {
  const [replying, setReplying] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  // Client-only: a relative timestamp rendered on the server would be frozen
  // into the cached HTML and insist a comment was posted "2 minutes ago" for
  // as long as that cache lived.
  const hydrated = useIsHydrated();
  const when = hydrated ? formatRelativeTime(comment.createdAt) : "";

  const isOwner = ownerId != null && comment.author.id === ownerId;
  const isMine = viewer?.id === comment.author.id;
  // The owner moderates anything. This only decides whether the button is
  // drawn — RLS is what actually permits the write, so hiding it is a UI
  // nicety rather than the access control.
  const viewerIsOwner = ownerId != null && viewer?.id === ownerId;
  const canDelete = isMine || viewerIsOwner;
  const replyCount = countDescendants(comment);
  const canReply = viewer != null && comment.depth < MAX_COMMENT_DEPTH;

  return (
    <article
      className={cn(
        comment.depth > 0 &&
          "border-l border-border/60 pl-4 md:pl-5",
      )}
    >
      <div className="py-4">
        <div className="flex gap-3">
          <Avatar size="sm" className="mt-0.5">
            {comment.author.avatarUrl && !comment.deleted && (
              // Google's avatar host can refuse hotlinked requests that carry a
              // Referer; GitHub's does not. Sending none is the portable fix.
              <AvatarImage
                src={comment.author.avatarUrl}
                referrerPolicy="no-referrer"
                alt=""
              />
            )}
            <AvatarFallback className="text-[10px]">
              {comment.deleted ? "–" : initials(comment.author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-medium">
                {comment.deleted ? "[deleted]" : comment.author.name}
              </span>
              {isOwner && !comment.deleted && (
                <Badge variant="secondary" className="text-[10px]">
                  Author
                </Badge>
              )}
              <span aria-hidden className="text-muted-foreground">
                ·
              </span>
              <time
                dateTime={comment.createdAt}
                className="text-xs text-muted-foreground"
              >
                {when ?? ""}
              </time>
              {comment.editedAt && !comment.deleted && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Plain text. Never a markdown or MDX pipeline — this is
                untrusted input and React's escaping is the whole defence. */}
            {/* `viewer` is implied by isMine gating the Edit button, but the
                type doesn't know that — and signing out mid-edit is real. */}
            {editing && viewer ? (
              <div className="mt-2">
                <CommentForm
                  viewer={viewer}
                  initialValue={comment.body}
                  submitLabel="Save changes"
                  autoFocus
                  compact
                  onCancel={() => setEditing(false)}
                  onSubmit={async (body) => {
                    // Unchanged text is a cancel, not an edit — otherwise it
                    // would stamp edited_at for nothing.
                    if (body.trim() === comment.body.trim()) {
                      setEditing(false);
                      return true;
                    }
                    const ok = await onEdit(comment.id, body);
                    if (ok) setEditing(false);
                    return ok;
                  }}
                />
              </div>
            ) : (
              <p
                className={cn(
                  "mt-1.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word",
                  comment.deleted && "italic text-muted-foreground",
                )}
              >
                {comment.deleted ? "This comment was removed." : comment.body}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-1">
              {canReply && !comment.deleted && !editing && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setReplying((v) => !v)}
                >
                  <Reply /> Reply
                </Button>
              )}

              {/* Only the author, never the owner — moderation may remove a
                  comment but must not rewrite what someone said. */}
              {isMine && !comment.deleted && !editing && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                >
                  <Pencil /> Edit
                </Button>
              )}

              {canDelete && !comment.deleted && !editing && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => void onDelete(comment.id)}
                  className={cn(!isMine && "text-muted-foreground")}
                >
                  <Trash2 /> {isMine ? "Delete" : "Remove"}
                </Button>
              )}

              {replyCount > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setCollapsed((v) => !v)}
                  className="text-muted-foreground"
                >
                  {collapsed
                    ? `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                    : "Collapse"}
                </Button>
              )}
            </div>

            {replying && viewer && (
              <div className="mt-3">
                <CommentForm
                  viewer={viewer}
                  autoFocus
                  placeholder={`Reply to ${comment.author.name}…`}
                  submitLabel="Reply"
                  onCancel={() => setReplying(false)}
                  onSubmit={async (body) => {
                    const ok = await onReply(comment.id, body);
                    if (ok) setReplying(false);
                    return ok;
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {!collapsed && comment.replies.length > 0 && (
        <div className="ml-3 md:ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              viewer={viewer}
              ownerId={ownerId}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function countDescendants(node: CommentNode): number {
  return node.replies.reduce((n, r) => n + 1 + countDescendants(r), 0);
}
