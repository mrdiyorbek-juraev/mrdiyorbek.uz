/**
 * Placeholder for a section that has no posts behind it yet.
 *
 * Deliberately inert: no href, and views are 0 rather than invented. The
 * previous version advertised 1,577 / 4,917 / 3,381 views on retrospectives
 * that were never written, and every card linked to /blog — a reader clicking
 * "The 2025 Retrospective" landed somewhere else entirely.
 *
 * When the real posts exist, give each one a `href` and the cards become
 * links again on their own.
 */
export const retros = [
  {
    year: 2025,
    views: 0,
    title: "The 2025 Retrospective",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    href: undefined,
  },
  {
    year: 2024,
    views: 0,
    title: "The 2024 Retrospective",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore magna.",
    href: undefined,
  },
  {
    year: 2023,
    views: 0,
    title: "The 2023 Retrospective",
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
    href: undefined,
  },
] as const;

export type Project = {
  title: string;
  description: string;
  tools: string[];
  href: string;
  live?: string;
  repo?: string;
  accent: string;
};

export const projects: Project[] = [
  {
    title: "OctaneJS",
    description:
      "A compile-time UI framework that keeps React's programming model and drops the virtual DOM. I'm on the core team, working across the runtime, SSR, hydration, and profiling.",
    tools: ["TypeScript", "Compilers", "SSR"],
    href: "https://octanejs.dev",
    repo: "https://github.com/octanejs/octane",
    accent: "from-sky-500/25 via-indigo-600/10 to-transparent",
  },
  {
    title: "Typix",
    description:
      "An extensible, headless rich-text editor built on Lexical — 25+ extensions, a CLI, and a plugin architecture, shipping as a platform's core editing experience.",
    tools: ["React", "TypeScript", "Lexical"],
    href: "https://www.typix.uz",
    repo: "https://github.com/mrdiyorbek-juraev/typix",
    accent: "from-emerald-500/25 via-teal-600/10 to-transparent",
  },
];

export const footerColumns = [
  {
    heading: "General",
    links: [
      { title: "Home", href: "/" },
      { title: "Blog", href: "/blog" },
      { title: "Projects", href: "/projects" },
      { title: "Shorts", href: "/shorts" },
      { title: "About", href: "/about" },
    ],
  },
  {
    heading: "The Website",
    links: [
      { title: "Bucket List", href: "/bucket-list" },
      { title: "Uses", href: "/uses" },
      { title: "Side Quests", href: "/side-quests" },
      { title: "Attribution", href: "/attribution" },
      { title: "Statistics", href: "/stats" },
      { title: "Guest Book", href: "/guestbook" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { title: "Book Notes", href: "/blog" },
      { title: "Starter Templates", href: "/projects" },
      { title: "RSS", href: "/rss.xml" },
      { title: "Mentorship", href: "/about" },
      { title: "Analytics", href: "/stats" },
    ],
  },
] as const;
