import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";
import { notes } from "@/lib/shorts";
import { siteConfig } from "@/lib/site";

/**
 * Only routes with real content. The placeholder pages (uses, bucket-list,
 * side-quests, guestbook, stats, attribution) are deliberately absent and
 * marked noindex — listing empty pages in a sitemap spends crawl budget
 * telling Google about nothing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const routes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.8 },
  ];

  if (notes.length > 0) {
    routes.push({
      url: `${base}/shorts`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const shorts: MetadataRoute.Sitemap = notes.map((note) => ({
    url: `${base}/shorts/${note.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...routes, ...posts, ...shorts];
}
