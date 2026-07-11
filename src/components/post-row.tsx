import Link from "next/link";
import { Clock, Eye } from "lucide-react";

import type { PostMeta } from "@/lib/blog";
import { cn, formatDate, formatNumber, thumbGradient } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PostRow({ post }: { post: PostMeta }) {
  return (
    <article className="border-b border-dashed border-border/60 py-8 last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_auto]"
      >
        <div className="space-y-2">
          <time
            dateTime={post.date}
            className="text-sm text-muted-foreground"
          >
            {formatDate(post.date)}
          </time>
          <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="text-muted-foreground">{post.description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4 text-primary" />
              {post.readingTime}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="size-4 text-primary" />
              {formatNumber(post.views)} views
            </span>
            {post.tags.length > 0 && (
              <span className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </span>
            )}
          </div>
        </div>

        <div
          className={cn(
            "relative hidden h-24 w-40 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br sm:block",
            thumbGradient(post.slug),
          )}
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
      </Link>
    </article>
  );
}
