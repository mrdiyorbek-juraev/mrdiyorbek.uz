import GithubSlugger from "github-slugger";

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * Headings for the table of contents, read from the raw MDX.
 *
 * Uses github-slugger — the same slugger rehype-slug applies when it stamps
 * ids onto the rendered headings. Hand-rolling the slug rule would drift the
 * moment a heading contains an apostrophe or non-ASCII text, and every anchor
 * would silently point at nothing.
 *
 * A single slugger instance walks the document in order, so duplicate headings
 * get the same `-1`, `-2` suffixes the rendered page uses.
 */
export function getHeadings(mdx: string): Heading[] {
  // Fenced code can contain lines starting with ## that are not headings.
  const prose = mdx.replace(/^```[\s\S]*?^```/gm, "");

  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  for (const line of prose.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    // Strip the markdown that never reaches the rendered text node.
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();

    if (!text) continue;

    headings.push({
      id: slugger.slug(text),
      text,
      level: match[1].length as 2 | 3,
    });
  }

  return headings;
}
