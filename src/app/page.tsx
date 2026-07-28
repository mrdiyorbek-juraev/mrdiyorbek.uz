import { getAllPosts } from "@/lib/blog";
import { getStatsMap, withStats } from "@/server/stats";
import { Hero } from "@/components/hero";
import { FeaturedPosts } from "@/components/featured-posts";
import { YearlyRetro } from "@/components/yearly-retro";
import { FeaturedProjects } from "@/components/featured-projects";

export const revalidate = 300;

export default async function HomePage() {
  const posts = withStats(getAllPosts().slice(0, 3), await getStatsMap("blog"));

  return (
    <>
      <Hero />
      <FeaturedPosts posts={posts} />
      <YearlyRetro />
      <FeaturedProjects />
    </>
  );
}
