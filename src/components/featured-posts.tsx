import type { PostMeta } from "@/lib/blog";
import { Reveal } from "@/components/reveal";
import { PostRow } from "@/components/post-row";
import { SectionHeading, MoreLink } from "@/components/section-heading";

export function FeaturedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24">
      <Reveal>
        <SectionHeading lead="Featured" highlight="Posts" arrow className="mb-6" />
      </Reveal>

      <div>
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.06}>
            <PostRow post={post} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <MoreLink href="/blog">See more posts</MoreLink>
      </Reveal>
    </section>
  );
}
