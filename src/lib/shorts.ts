export type Note = {
  slug: string;
  title: string;
  views: number;
  tags: string[];
  content: string;
};

export const notes: Note[] = [
  {
    slug: "absolute-import",
    title: "Absolute Import",
    views: 7657,
    tags: ["react"],
    content: `Configure absolute imports so you can write \`@/components/...\` instead of \`../../../\`.

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
\`\`\`

Next.js and Vite both read this automatically.`,
  },
  {
    slug: "authentication-context",
    title: "Authentication Context",
    views: 13558,
    tags: ["nextjs", "react"],
    content: `A tiny auth context pattern: provide the user once, read it anywhere with a hook.

\`\`\`tsx
const AuthContext = createContext<User | null>(null);
export const useUser = () => useContext(AuthContext);
\`\`\`

Wrap the app in the provider and hydrate from your session on mount.`,
  },
  {
    slug: "bash-workflow-shortcuts",
    title: "Bash Workflow Shortcuts",
    views: 1018,
    tags: ["mac"],
    content: `Aliases I can't live without:

\`\`\`bash
alias gs="git status"
alias gc="git commit -m"
alias ..="cd .."
\`\`\`

Drop them in \`~/.zshrc\` and reload with \`source ~/.zshrc\`.`,
  },
  {
    slug: "blur-loader-with-cloudinary",
    title: "Blur Loader with Cloudinary",
    views: 1812,
    tags: ["nextjs"],
    content: `Generate a tiny blurred placeholder with Cloudinary transformations and pass it to \`next/image\` as \`blurDataURL\` for a smooth load-in.`,
  },
  {
    slug: "branch-rules",
    title: "Branch Rules",
    views: 669,
    tags: ["github"],
    content: `Protect \`main\`: require PR reviews, passing checks, and linear history. It stops accidental force-pushes and keeps the log readable.`,
  },
  {
    slug: "conditional-link",
    title: "Conditional Link",
    views: 3849,
    tags: ["nextjs", "react"],
    content: `A component that renders a \`<Link>\` when \`href\` exists, and a plain \`<span>\` otherwise — so callers don't branch at every call site.`,
  },
  {
    slug: "conventional-commits-readme",
    title: "Conventional Commits Readme",
    views: 9966,
    tags: ["git"],
    content: `\`feat:\`, \`fix:\`, \`chore:\`, \`docs:\` — a convention that makes history skimmable and enables automated changelogs and semantic-release.`,
  },
  {
    slug: "derived-state",
    title: "Derived State",
    views: 400,
    tags: ["react"],
    content: `Don't store what you can compute. If a value can be derived from props or existing state during render, do that instead of syncing it in an effect.`,
  },
  {
    slug: "dock-configuration",
    title: "Dock Configuration",
    views: 394,
    tags: ["mac"],
    content: `Speed up the macOS Dock auto-hide animation:

\`\`\`bash
defaults write com.apple.dock autohide-time-modifier -float 0.15
killall Dock
\`\`\``,
  },
  {
    slug: "prettier-config",
    title: "Prettier Config",
    views: 2044,
    tags: ["prettier", "styling"],
    content: `My baseline \`.prettierrc\`: no semicolons debate — pick one, commit it, and let the tool end the argument forever.`,
  },
  {
    slug: "vscode-snippets",
    title: "VSCode Snippets",
    views: 5310,
    tags: ["vscode"],
    content: `Custom snippets for boilerplate you type daily — a React component, a test block, a console.log with the variable name baked in.`,
  },
  {
    slug: "tailwind-reset",
    title: "Tailwind Reset",
    views: 1290,
    tags: ["tailwind-css", "styling"],
    content: `Tailwind's Preflight already resets margins and box-sizing. Add only the project-specific base styles you actually need on top of it.`,
  },
];
