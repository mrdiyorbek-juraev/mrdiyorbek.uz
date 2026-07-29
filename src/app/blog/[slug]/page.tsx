import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mdx } from "@/components/mdx";
import { PageShell } from "@/components/page-shell";
import {
  ArticleStats,
  EngagementProvider,
  LikeButton,
} from "@/components/content/engagement";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${siteConfig.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    // Without an explicit canonical, Google is free to pick a different URL
    // as the one it indexes.
    alternates: { canonical: url },
    authors: [{ name: siteConfig.author, url: siteConfig.url }],
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [siteConfig.author],
      tags: post.tags,
      locale: post.lang === "uz" ? "uz_UZ" : "en_US",
      // Declaring openGraph here replaces the file-convention image entirely,
      // so the per-post card has to be named explicitly.
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${url}/opengraph-image`],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const url = `${siteConfig.url}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: post.lang,
    keywords: post.tags.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
  };

  return (
    // The page stays statically generated; only the counters inside this
    // provider are live.
    <EngagementProvider kind="blog" slug={post.slug}>
      <script
        type="application/ld+json"
        // Values come from local MDX frontmatter, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageShell className="space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to blog
        </Link>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <ArticleStats readingTime={post.readingTime} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-lg text-muted-foreground">{post.description}</p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <Separator />

        {/* The body may not be in the site's default language; declaring it
            lets Google and screen readers treat the text correctly. */}
        <div lang={post.lang}>
          <Mdx source={post.content} />
        </div>

        <Separator />

        <LikeButton className="py-4" />
      </PageShell>
    </EngagementProvider>
  );
}
