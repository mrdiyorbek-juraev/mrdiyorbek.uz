import type { Metadata } from "next";

import { getAllPosts } from "@/lib/blog";
import { getStatsMap, withStats } from "@/server/stats";
import { getCommenterMap } from "@/server/comments";
import { Hero } from "@/components/hero";
import { FeaturedPosts } from "@/components/featured-posts";
import { YearlyRetro } from "@/components/yearly-retro";
import { FeaturedProjects } from "@/components/featured-projects";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 300;

export default async function HomePage() {
  const [stats, commenters] = await Promise.all([
    getStatsMap("blog"),
    getCommenterMap("blog"),
  ]);
  const posts = withStats(getAllPosts().slice(0, 3), stats).map((post) => ({
    ...post,
    commenters: commenters.get(post.slug),
  }));

  return (
    <>
      <Hero />
      <FeaturedPosts posts={posts} />
      <YearlyRetro />
      <FeaturedProjects />
    </>
  );
}
