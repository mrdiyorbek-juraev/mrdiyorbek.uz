import { COMMENTER_AVATARS, type Commenters } from "@/server/comments";
import { cn, formatNumber } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { initials } from "@/components/comments/types";

/**
 * Stacked avatars of who's commented, for list cards.
 *
 * A server component — no interactivity, and keeping it off the client means
 * the list pages ship no extra JavaScript for it.
 */
export function CommenterAvatars({
  commenters,
  className,
}: {
  commenters?: Commenters;
  className?: string;
}) {
  if (!commenters || commenters.total === 0) return null;

  const overflow = commenters.total - Math.min(commenters.authors.length, COMMENTER_AVATARS);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <AvatarGroup>
        {commenters.authors.slice(0, COMMENTER_AVATARS).map((author) => (
          <Avatar key={author.id} size="sm" title={author.name}>
            {author.avatarUrl && (
              // Same reason as the thread: Google's avatar host can refuse
              // requests that carry a Referer.
              <AvatarImage
                src={author.avatarUrl}
                referrerPolicy="no-referrer"
                alt=""
              />
            )}
            <AvatarFallback className="text-[9px]">
              {initials(author.name)}
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 && (
          <AvatarGroupCount>+{formatNumber(overflow)}</AvatarGroupCount>
        )}
      </AvatarGroup>

      <span className="text-sm text-muted-foreground">
        {commenters.total === 1 ? "1 comment" : `${formatNumber(commenters.total)} commenters`}
      </span>
    </span>
  );
}
