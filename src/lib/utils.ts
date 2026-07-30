import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n)
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
]

const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })

/**
 * "3 hours ago" for comment timestamps.
 *
 * Rendered client-side only. Formatting it on the server would bake the
 * server's render time into static HTML, so a cached page would insist a
 * comment was posted "2 minutes ago" for as long as the cache lived.
 */
export function formatRelativeTime(date: string | Date) {
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 45) return "just now"

  for (const [unit, secondsPerUnit] of RELATIVE_UNITS) {
    if (seconds >= secondsPerUnit) {
      return relative.format(-Math.floor(seconds / secondsPerUnit), unit)
    }
  }
  return "just now"
}

// Deterministic gradient class for a slug, used for placeholder thumbnails.
const THUMB_GRADIENTS = [
  "from-emerald-500/40 via-teal-700/30 to-slate-900",
  "from-sky-500/40 via-indigo-700/30 to-slate-900",
  "from-amber-500/40 via-orange-700/30 to-slate-900",
  "from-fuchsia-500/40 via-purple-700/30 to-slate-900",
  "from-cyan-500/40 via-emerald-700/30 to-slate-900",
]

export function thumbGradient(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return THUMB_GRADIENTS[h % THUMB_GRADIENTS.length]
}
