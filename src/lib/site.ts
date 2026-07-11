export const siteConfig = {
  name: "Diyorbek",
  title: "Diyorbek — Developer & Writer",
  description:
    "I work with the React ecosystem, and write to teach people how to rebuild and redefine fundamental concepts through mental models.",
  url: "https://example.com",
  author: "Diyorbek",
  role: "Design Engineer",
  status: "Currently open for remote opportunities",
  nav: [
    { title: "Home", href: "/" },
    { title: "Blog", href: "/blog" },
    { title: "Projects", href: "/projects" },
    { title: "Shorts", href: "/shorts" },
    { title: "About", href: "/about" },
  ],
  // "More" mega-menu
  moreFeatured: [
    {
      title: "Uses",
      description: "A peek into my digital workspace",
      href: "/uses",
    },
    {
      title: "Bucket List",
      description: "Things to do at least once in life",
      href: "/bucket-list",
    },
    {
      title: "Side Quests",
      description: "New skills and adventures",
      href: "/side-quests",
    },
  ],
  moreLinks: [
    {
      title: "Guest Book",
      description: "Leave me a message",
      href: "/guestbook",
      icon: "book",
    },
    {
      title: "Statistics",
      description: "Crunched up numbers",
      href: "/stats",
      icon: "chart",
    },
    {
      title: "Attribution",
      description: "Journey to create this site",
      href: "/attribution",
      icon: "hand",
    },
  ],
  social: {
    github: "https://github.com/",
    twitter: "https://twitter.com/",
    email: "muzaffarbeksat@gmail.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
