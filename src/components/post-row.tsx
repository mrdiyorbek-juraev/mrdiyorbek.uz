import Link from "next/link";

import type { PostWithStats } from "@/lib/blog";
import { cn, formatDate, thumbGradient } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatBar } from "@/components/content/stat-bar";
import { CommenterAvatars } from "@/components/comments/commenter-avatars";

export function PostRow({ post }: { post: PostWithStats }) {
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

          <StatBar
            readingTime={post.readingTime}
            views={post.views}
            likes={post.likes}
            className="pt-1"
          >
            {post.tags.length > 0 && (
              <span className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </span>
            )}
          </StatBar>

          {/* Only rendered once someone has actually commented. */}
          <CommenterAvatars commenters={post.commenters} className="pt-1" />
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
