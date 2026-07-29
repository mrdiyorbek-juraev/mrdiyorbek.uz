import { ImageResponse } from "next/og";

import { getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Per-post social card, so a shared link previews the article's own title. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0d1512",
          backgroundImage:
            "radial-gradient(circle at 82% 12%, rgba(63,221,154,0.20), transparent 55%)",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: "#3fdd9a",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {siteConfig.fullName}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: post && post.title.length > 46 ? 64 : 82,
            fontWeight: 700,
            color: "#f5f7f6",
            letterSpacing: -2,
            lineHeight: 1.12,
          }}
        >
          {post?.title ?? "Blog"}
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 25, color: "#6f847c" }}>
          <span>mrdiyorbek.uz</span>
          {post && <span>·</span>}
          {post && <span>{post.readingTime}</span>}
        </div>
      </div>
    ),
    size,
  );
}
