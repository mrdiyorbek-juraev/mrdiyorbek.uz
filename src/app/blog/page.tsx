import type { Metadata } from "next";

import { getAllPosts } from "@/lib/blog";
import { getStatsMap, withStats } from "@/server/stats";
import { getCommenterMap } from "@/server/comments";
import { BlogExplorer } from "@/components/blog/blog-explorer";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog",
  description:
    "Thoughts, mental models, and tutorials about front-end development.",
};

// Counters are read here rather than fetched from the API: a statically
// generated page has no server of its own to call at build time.
export const revalidate = 300;

export default async function BlogPage() {
  const [stats, commenters] = await Promise.all([
    getStatsMap("blog"),
    getCommenterMap("blog"),
  ]);
  const posts = withStats(getAllPosts(), stats).map((post) => ({
    ...post,
    commenters: commenters.get(post.slug),
  }));
  return <BlogExplorer posts={posts} />;
}
