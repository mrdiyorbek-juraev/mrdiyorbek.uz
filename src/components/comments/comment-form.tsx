"use client";

import * as React from "react";
import { Loader2, MessageSquare } from "lucide-react";

import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/server/comments";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initials, type Viewer } from "@/components/comments/types";

type Props = {
  viewer: NonNullable<Viewer>;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
};

export function CommentForm({
  viewer,
  placeholder = "Share your thoughts…",
  submitLabel = "Post comment",
  autoFocus = false,
  onSubmit,
  onCancel,
}: Props) {
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const trimmed = body.trim();
  const tooShort = trimmed.length < MIN_COMMENT_LENGTH;
  const tooLong = trimmed.length > MAX_COMMENT_LENGTH;
  const remaining = MAX_COMMENT_LENGTH - trimmed.length;

  async function submit() {
    if (tooShort || tooLong || busy) return;
    setBusy(true);
    const ok = await onSubmit(trimmed);
    setBusy(false);
    // Keep the text on failure so a rate limit or dropped request doesn't
    // throw away what someone just wrote.
    if (ok) setBody("");
  }

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-1">
        {viewer.avatarUrl && (
          <AvatarImage
            src={viewer.avatarUrl}
            referrerPolicy="no-referrer"
            alt=""
          />
        )}
        <AvatarFallback className="text-[10px]">
          {initials(viewer.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        <Textarea
          value={body}
          autoFocus={autoFocus}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter inserts a newline; Cmd/Ctrl+Enter submits.
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
            if (e.key === "Escape" && onCancel) onCancel();
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-h-24 resize-y text-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => void submit()} disabled={tooShort || tooLong || busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageSquare className="size-4" />
            )}
            {submitLabel}
          </Button>

          {onCancel && (
            <Button size="sm" variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
          )}

          {/* Only warn as the limit approaches — a permanent counter is noise. */}
          {remaining < 200 && (
            <span
              className={cn(
                "text-xs tabular-nums",
                tooLong ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {remaining} left
            </span>
          )}

          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
            ⌘↵ to post
          </span>
        </div>
      </div>
    </div>
  );
}
