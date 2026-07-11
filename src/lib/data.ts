export const retros = [
  {
    year: 2025,
    views: 1577,
    title: "The 2025 Retrospective",
    description: "Travels, Three Diving Licenses, and Trading Money for Memories",
    href: "/blog",
  },
  {
    year: 2024,
    views: 4917,
    title: "The 2024 Retrospective",
    description: "First Full-Time Year, Solo Travel while Working, Socializing, and more!",
    href: "/blog",
  },
  {
    year: 2023,
    views: 3381,
    title: "The 2023 Retrospective",
    description: "Graduation, Tech Writing, First Job, Mentorship, and more!",
    href: "/blog",
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
    title: "Dimension AI",
    description:
      "AI coworker that connects to tools like email, calendar, Slack, docs, and project systems to help teams reduce busywork.",
    tools: ["Next.js", "Tailwind", "TypeScript"],
    href: "/projects",
    live: "https://example.com",
    accent: "from-indigo-500/25 via-sky-600/10 to-transparent",
  },
  {
    title: "Hexcape",
    description:
      "A game that combines iOS and a physical puzzle game, using 3D, 360 world view, and AR.",
    tools: ["Swift", "SceneKit", "ARKit"],
    href: "/projects",
    live: "https://example.com",
    accent: "from-emerald-500/25 via-teal-600/10 to-transparent",
  },
  {
    title: "Notiolink",
    description:
      "Self-hostable branded link shortener built with Next.js & Notion API.",
    tools: ["Next.js", "Tailwind", "Notion API"],
    href: "/projects",
    live: "https://example.com",
    repo: "https://github.com/",
    accent: "from-amber-500/25 via-orange-600/10 to-transparent",
  },
  {
    title: "Overkill",
    description:
      "A tiny, type-safe state manager for React with zero boilerplate and devtools support.",
    tools: ["TypeScript", "React", "Vite"],
    href: "/projects",
    repo: "https://github.com/",
    accent: "from-fuchsia-500/25 via-purple-600/10 to-transparent",
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
      { title: "RSS", href: "/blog" },
      { title: "Mentorship", href: "/about" },
      { title: "Analytics", href: "/stats" },
    ],
  },
] as const;
