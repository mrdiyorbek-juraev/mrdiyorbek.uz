import Link from "next/link";
import { Mail } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { footerColumns } from "@/lib/data";
import {
  GitHubIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand */}
          <div className="space-y-4">
            <p className="text-lg font-semibold tracking-tight">
              {siteConfig.author}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Helping you rebuild and redefine fundamental concepts through
              mental models.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a
                href={`mailto:${siteConfig.social.email}`}
                aria-label="Email"
                className="transition-colors hover:text-primary"
              >
                <Mail className="size-5" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="transition-colors hover:text-primary"
              >
                <LinkedInIcon className="size-5" />
              </a>
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="transition-colors hover:text-primary"
              >
                <GitHubIcon className="size-5" />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="X (Twitter)"
                className="transition-colors hover:text-primary"
              >
                <XIcon className="size-5" />
              </a>
              <a
                href={siteConfig.social.telegram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Telegram"
                className="transition-colors hover:text-primary"
              >
                <TelegramIcon className="size-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <nav key={col.heading} className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground/80">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.author}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
