import { siteConfig } from "@/lib/site";

export type TeamMember = {
  name: string;
  /** Optional line under the name in card view, e.g. "Core · Compiler". */
  role?: string;
  /**
   * Either a path under public/ (`/team/name.jpg`) or a full URL.
   * Remote hosts must be allowed in next.config.ts — avatars.githubusercontent.com
   * already is, so a GitHub avatar URL can be pasted straight in.
   */
  avatar?: string;
  github?: string;
  x?: string;
  linkedin?: string;
  bluesky?: string;
  youtube?: string;
  website?: string;
};

/**
 * The OctaneJS core team, rendered by <OctaneTeam /> in MDX.
 *
 * Lives here rather than being passed as a prop because the MDX pipeline
 * silently drops expression attributes — an array prop arrives as undefined.
 * A typed module is better anyway: the shape is checked, and adding someone is
 * one entry rather than editing markup.
 *
 * Order is preserved as written.
 */
export const octaneTeam: TeamMember[] = [
  {
    name: "Dominic Gannaway",
    role: "Creator",
    // Canonical GitHub avatar, resolved from github.com/trueadm.png rather
    // than guessed — the numeric id is stable across username changes.
    avatar: "https://avatars.githubusercontent.com/u/1519870?v=4",
    github: "https://github.com/trueadm",
    x: "https://x.com/trueadm",
    linkedin: "https://www.linkedin.com/in/dominic-gannaway-414b7750/",
  },
  {
    name: "Michal Makowski",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/13287482?v=4",
    github: "https://github.com/WebEferen",
    x: "https://x.com/maqsiak",
    linkedin: "https://www.linkedin.com/in/mmakowski97/",
  },
  {
    name: "Leonidas",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/329182?v=4",
    github: "https://github.com/leonidaz",
    x: "https://x.com/leonidas_bt",
  },
  {
    name: "Tanner Linsley",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/5580297?v=4",
    github: "https://github.com/tannerlinsley",
    x: "https://x.com/tannerlinsley",
    bluesky: "https://bsky.app/profile/tannerlinsley.com",
  },
  {
    // Read from siteConfig rather than repeated, so changing a handle in one
    // place updates the hero, the footer and this list together.
    name: siteConfig.fullName,
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/257270292?v=4",
    github: siteConfig.social.github,
    x: siteConfig.social.twitter,
    linkedin: siteConfig.social.linkedin,
  },
  {
    name: "Dominik Dorfmeister",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/1021430?v=4",
    github: "https://github.com/tkdodo",
    // https, not the http the handle is usually shared as.
    x: "https://x.com/TkDodo",
    bluesky: "https://bsky.app/profile/tkdodo.eu",
    website: "https://sifa.id/p/tkdodo.eu",
  },
  {
    name: "Corbin Crutchley",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/9100169?v=4",
    github: "https://github.com/crutchcorn",
    x: "https://x.com/crutchcorn",
    linkedin: "https://www.linkedin.com/in/corbincrutchley/",
  },
  {
    name: "Kevin Van Cott",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/28243511?v=4",
    github: "https://github.com/kevinvandy",
    x: "https://x.com/KevinVanCott",
    linkedin: "https://www.linkedin.com/in/kevinthomasvancott",
    website: "https://kevinvancott.dev",
  },
  {
    name: "Manuel Schiller",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/6340397?v=4",
    github: "https://github.com/schiller-manuel",
    x: "https://x.com/schanuelmiller",
    bluesky: "https://bsky.app/profile/manuelschiller.bsky.social",
  },
  {
    name: "Jack Herrington",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/22392?v=4",
    github: "https://github.com/jherr",
    x: "https://x.com/jherr",
    youtube: "https://youtube.com/c/JackHerrington",
  },
  {
    name: "Alem Tuzlak",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/18480956?v=4",
    github: "https://github.com/AlemTuzlak",
    x: "https://x.com/AlemTuzlak",
    bluesky: "https://bsky.app/profile/alem.forge42.dev",
  },
  {
    name: "Kyle Mathews",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/71047?v=4",
    github: "https://github.com/KyleAMathews",
    website: "https://www.bricolage.io",
  },
  {
    name: "Jimmy Lai",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/11064311?v=4",
    // GitHub was not supplied — inferred from the shared handle and confirmed
    // against the profile name and bio.
    github: "https://github.com/feedthejim",
    x: "https://x.com/feedthejim",
    linkedin: "https://www.linkedin.com/in/feedthejim/",
    bluesky: "https://bsky.app/profile/feedthej.im",
  },
  {
    name: "Callie Riggins Zetino",
    role: "Core Team",
    avatar: "https://avatars.githubusercontent.com/u/23196205?v=4",
    github: "https://github.com/calinoracation",
    linkedin: "https://www.linkedin.com/in/calinoracation/",
  },
  // {
  //   name: "Full Name",
  //   role: "Core · Runtime",
  //   avatar: "https://avatars.githubusercontent.com/u/000000?v=4",
  //   github: "https://github.com/handle",
  //   x: "https://x.com/handle",
  //   linkedin: "https://www.linkedin.com/in/handle",
  //   bluesky: "https://bsky.app/profile/handle",
  //   youtube: "https://youtube.com/@handle",
  //   website: "https://example.com",
  // },
];
