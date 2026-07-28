import { Clock, Eye, Heart } from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";

type Props = {
  readingTime?: string;
  views?: number;
  likes?: number;
  className?: string;
  /** Extra items rendered inline after the counters, e.g. tag badges. */
  children?: React.ReactNode;
};

/**
 * The `read time · views · likes` row shared by cards, list rows and article
 * headers. Purely presentational — counters arrive already resolved.
 */
export function StatBar({
  readingTime,
  views,
  likes,
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {readingTime && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-primary" />
          {readingTime}
        </span>
      )}
      {views !== undefined && (
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-4 text-primary" />
          {formatNumber(views)} views
        </span>
      )}
      {likes !== undefined && (
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-4 text-primary" />
          {formatNumber(likes)}
        </span>
      )}
      {children}
    </div>
  );
}
