export const siteConfig = {
  name: "Diyorbek",
  title: "Diyorbek — Software Engineer & Writer",
  // Plain text on purpose: this is the SEO/OpenGraph description. The hero
  // renders its own linked version of the same sentence.
  description:
    "Software engineer on the OctaneJS core team, a compiled framework that keeps React's programming model and drops the virtual DOM. Author of Typix, a headless rich-text editor framework for React.",
  // metadataBase — every canonical and OG URL resolves against this.
  url: "https://mrdiyorbek.uz",
  author: "Diyorbek",
  /** Legal name, for structured data and social cards — what people search. */
  fullName: "Diyorbek Juraev",
  role: "Software Engineer · OctaneJS Core Team",
  status: "Currently open for remote opportunities",
  work: {
    octane: { name: "OctaneJS", href: "https://octanejs.dev" },
    typix: { name: "Typix", href: "https://www.typix.uz" },
  },
  nav: [
    { title: "Home", href: "/" },
    { title: "Blog", href: "/blog" },
    { title: "Projects", href: "/projects" },
    { title: "Shorts", href: "/shorts" },
    { title: "About", href: "/about" },
  ],
  /**
   * Hides the "More" mega-menu in the header, on desktop and in the mobile
   * sheet. Everything it links to is still a placeholder page — flip to true
   * once those have real content.
   */
  showMoreMenu: false,
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
    github: "https://github.com/mrdiyorbek-juraev",
    twitter: "https://x.com/D_Juraevv",
    linkedin: "https://www.linkedin.com/in/diyorbek-juraev",
    telegram: "https://t.me/Diyorbekk_dev",
    email: "mrdiyorbekjuraev@gmail.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
