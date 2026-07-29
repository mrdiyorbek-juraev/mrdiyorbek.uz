import type { Metadata } from "next";

import { getAllPosts } from "@/lib/blog";
import { getStatsMap, withStats } from "@/server/stats";
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
  const posts = withStats(getAllPosts(), await getStatsMap("blog"));
  return <BlogExplorer posts={posts} />;
}
