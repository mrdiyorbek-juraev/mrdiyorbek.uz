import Link from "next/link";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

import { AmbiguityQuiz } from "@/components/mdx/ambiguity-quiz";
import { BeforeAfter } from "@/components/mdx/before-after";
import { CopyCommand } from "@/components/mdx/copy-command";
import { Callout, PullQuote, Step } from "@/components/mdx/callout";

/**
 * Components a post can use by name in MDX. Client components are fine here —
 * next-mdx-remote renders them as islands inside the server-rendered article.
 */
const components = {
  AmbiguityQuiz,
  BeforeAfter,
  Callout,
  CopyCommand,
  PullQuote,
  Step,
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...props} className="font-medium underline underline-offset-4" />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        {...props}
        className="font-medium underline underline-offset-4"
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
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ],
          },
        }}
      />
    </div>
  );
}
