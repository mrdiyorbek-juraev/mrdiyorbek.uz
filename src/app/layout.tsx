import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { siteConfig } from "@/lib/site";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";

/**
 * Wotfard is a paid licence, so it is self-hosted rather than fetched.
 *
 * Only the .woff2 lives in the repo, and deliberately not under public/ —
 * everything there is served at a guessable URL, which would have published
 * the desktop .otf and the licence PDFs alongside it. next/font/local emits
 * this under a hashed path and inlines the @font-face, so there is no extra
 * round trip and no render-blocking stylesheet.
 *
 * Only Regular (400) was licensed; see the note on synthetic bold below.
 */
const wotfard = localFont({
  src: "./fonts/wotfard-regular.woff2",
  variable: "--font-sans",
  weight: "400",
  style: "normal",
  display: "swap",
  // Metric-matched fallback, so swapping from the system font when Wotfard
  // arrives doesn't reflow the page.
  adjustFontFallback: "Arial",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  // No `alternates.canonical` here on purpose: layout metadata is inherited,
  // so a canonical set at the root makes every child page claim to be a
  // duplicate of the homepage. Each page declares its own.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Search Console's HTML-tag verification. Set GOOGLE_SITE_VERIFICATION in
  // Vercel and redeploy — Next omits the tag entirely when it's unset, so
  // there's nothing to clean up if you verify by DNS instead.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

/**
 * Person + WebSite graph. This is what lets Google build a knowledge panel for
 * a name and tie the profile links together as the same identity.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.fullName,
      alternateName: siteConfig.name,
      url: siteConfig.url,
      email: `mailto:${siteConfig.social.email}`,
      jobTitle: "Software Engineer",
      description: siteConfig.description,
      sameAs: [
        siteConfig.social.github,
        siteConfig.social.linkedin,
        siteConfig.social.twitter,
        siteConfig.social.telegram,
      ],
      knowsAbout: [
        "OctaneJS",
        "Typix",
        "React",
        "TypeScript",
        "Next.js",
        "Lexical",
        "Design systems",
        "Web performance",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${wotfard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          // Built from siteConfig, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SmoothScroll>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </SmoothScroll>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
