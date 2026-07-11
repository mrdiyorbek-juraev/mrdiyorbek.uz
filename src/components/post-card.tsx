import Link from "next/link";

import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group border-b py-6 last:border-b-0">
      <Link href={`/blog/${post.slug}`} className="block space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight group-hover:underline">
          {post.title}
        </h2>
        <p className="text-muted-foreground">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
