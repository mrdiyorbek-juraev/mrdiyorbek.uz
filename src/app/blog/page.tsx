import type { Metadata } from "next";

import { getAllPosts } from "@/lib/blog";
import { BlogExplorer } from "@/components/blog/blog-explorer";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts, mental models, and tutorials about front-end development.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogExplorer posts={posts} />;
}
