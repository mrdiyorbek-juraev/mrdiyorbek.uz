import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Empty placeholder for now — kept out of the index until it has content.
export const metadata: Metadata = {
  title: "Statistics",
  robots: { index: false, follow: true },
};

export default function StatsPage() {
  return (
    <PlaceholderPage
      title="Statistics"
      description="Crunched up numbers about this site and what I've been building."
    />
  );
}
