"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, NotebookPen, LineChart, Hand } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const moreIcons = {
  book: NotebookPen,
  chart: LineChart,
  hand: Hand,
} as const;

const cardGradients = [
  "from-emerald-500/25 via-teal-600/10 to-transparent",
  "from-sky-500/25 via-indigo-600/10 to-transparent",
  "from-cyan-500/25 via-emerald-600/10 to-transparent",
];

export function SiteHeader() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const openMore = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMoreOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMoreOpen(false), 120);
  };

  React.useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      {/* Desktop pill */}
      <nav className="relative hidden md:block">
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2 py-1.5 shadow-lg shadow-black/20 backdrop-blur-xl">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item.href) && "text-primary",
              )}
            >
              {item.title}
            </Link>
          ))}

          <span className="mx-1 h-5 w-px bg-border/70" aria-hidden />

          <div
            className="relative"
            onMouseEnter={openMore}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={cn(
                "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                moreOpen && "text-foreground",
              )}
            >
              More
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  moreOpen && "rotate-180",
                )}
              />
            </button>
          </div>

          <span className="mx-1 h-5 w-px bg-border/70" aria-hidden />
          <ModeToggle />
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={openMore}
              onMouseLeave={scheduleClose}
              className="absolute left-1/2 top-[calc(100%+0.75rem)] w-[46rem] -translate-x-1/2"
            >
              <div className="grid grid-cols-[1.6fr_1fr] gap-3 rounded-3xl border border-border/60 bg-card/90 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="grid grid-cols-3 gap-3">
                  {siteConfig.moreFeatured.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl border border-border/50 p-4"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t transition-transform duration-500 group-hover:scale-105",
                          cardGradients[i % cardGradients.length],
                        )}
                      />
                      <div className="absolute inset-0 bg-grid opacity-40" />
                      <div className="relative">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  {siteConfig.moreLinks.map((item) => {
                    const Icon = moreIcons[item.icon];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-accent/50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/60 text-muted-foreground transition-colors group-hover:text-primary">
                          <Icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile pill */}
      <div className="flex w-full max-w-md items-center justify-between rounded-full border border-border/60 bg-card/70 px-2 py-1.5 shadow-lg shadow-black/20 backdrop-blur-xl md:hidden">
        <Link href="/" className="px-3 font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-1">
          <ModeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-2">
                {siteConfig.nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                      isActive(item.href) && "text-primary",
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {[...siteConfig.moreFeatured, ...siteConfig.moreLinks].map(
                  (item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  ),
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
