import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  published: boolean;
  readingTime: string;
  /** BCP-47 tag for the post body. Drives <article lang> and og:locale. */
  lang: string;
  image?: string;
};

export type Post = PostMeta & {
  content: string;
};

/** A post joined with its live counters, as list pages render it. */
export type PostWithStats = PostMeta & { views: number; likes: number };

function readPostFile(slug: string): Post | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ? new Date(data.date).toISOString() : new Date(0).toISOString(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    published: data.published ?? true,
    readingTime: readingTime(content).text,
    lang: typeof data.lang === "string" ? data.lang : "en",
    image: data.image,
    content,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): Post | null {
  const post = readPostFile(slug);
  if (!post || (!post.published && process.env.NODE_ENV === "production")) {
    return null;
  }
  return post;
}

export function getAllPosts(): PostMeta[] {
  return getAllSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map(({ content: _content, ...meta }) => meta);
}
