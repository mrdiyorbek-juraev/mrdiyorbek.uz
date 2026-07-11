import { getAllPosts } from "@/lib/blog";
import { Hero } from "@/components/hero";
import { FeaturedPosts } from "@/components/featured-posts";
import { YearlyRetro } from "@/components/yearly-retro";
import { FeaturedProjects } from "@/components/featured-projects";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <Hero />
      <FeaturedPosts posts={posts} />
      <YearlyRetro />
      <FeaturedProjects />
    </>
  );
}
