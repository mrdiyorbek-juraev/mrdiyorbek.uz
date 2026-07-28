import type { Metadata } from "next";

import { notes } from "@/lib/shorts";
import { getStatsMap, withStats } from "@/server/stats";
import { ShortsExplorer } from "@/components/shorts/shorts-explorer";

export const metadata: Metadata = {
  title: "Shorts",
  description: "My personal notes that's not long enough to be a blog post.",
};

export const revalidate = 300;

export default async function ShortsPage() {
  return <ShortsExplorer notes={withStats(notes, await getStatsMap("short"))} />;
}
