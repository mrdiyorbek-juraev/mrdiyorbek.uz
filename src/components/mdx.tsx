import Link from "next/link";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

import { Alert } from "@/components/mdx/alert";
import { AmbiguityQuiz } from "@/components/mdx/ambiguity-quiz";
import { BeforeAfter } from "@/components/mdx/before-after";
import { CopyCommand } from "@/components/mdx/copy-command";
import { Callout, PullQuote, Step } from "@/components/mdx/callout";
import { OctaneTeam } from "@/components/mdx/octane-team";

/**
 * Components a post can use by name in MDX. Client components are fine here —
 * next-mdx-remote renders them as islands inside the server-rendered article.
 */
const components = {
  Alert,
  AmbiguityQuiz,
  BeforeAfter,
  Callout,
  CopyCommand,
  OctaneTeam,
  PullQuote,
  Step,
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");

    // rehype-autolink-headings wraps every heading's text in an anchor. Those
    // are navigation affordances, not links in prose — styling them green
    // would paint every heading on the site. Checked here rather than left to
    // a CSS override, so it cannot break on cascade or layer ordering.
    const isHeadingAnchor = String(props.className ?? "").includes(
      "heading-anchor",
    );
    if (isHeadingAnchor) {
      return <a href={href} {...props} />;
    }
    // Brand green with a matching underline. The underline starts dimmer than
    // the text and solidifies on hover, so a paragraph full of links doesn't
    // read as striped.
    const style =
      "font-medium text-primary underline decoration-primary/40 decoration-1 underline-offset-4 transition-colors hover:decoration-primary";

    if (isInternal) {
      return <Link href={href} {...props} className={style} />;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        {...props}
        className={style}
      />
    );
  },
  img: (props: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      className="rounded-lg border"
      width={800}
      height={450}
      {...(props as ComponentPropsWithoutRef<typeof Image>)}
    />
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose-portfolio">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: { dark: "github-dark", light: "github-light" },
                  keepBackground: false,
                },
              ],
              [
                rehypeAutolinkHeadings,
                // Tagged so the `a` renderer below can tell a heading anchor
                // from a link in prose and leave it unstyled.
                { behavior: "wrap", properties: { className: ["heading-anchor"] } },
              ],
            ],
          },
        }}
      />
    </div>
  );
}
