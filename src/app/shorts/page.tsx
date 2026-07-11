import type { Metadata } from "next";

import { notes } from "@/lib/shorts";
import { ShortsExplorer } from "@/components/shorts/shorts-explorer";

export const metadata: Metadata = {
  title: "Shorts",
  description: "My personal notes that's not long enough to be a blog post.",
};

export default function ShortsPage() {
  return <ShortsExplorer notes={notes} />;
}
