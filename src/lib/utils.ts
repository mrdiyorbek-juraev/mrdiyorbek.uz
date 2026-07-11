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
