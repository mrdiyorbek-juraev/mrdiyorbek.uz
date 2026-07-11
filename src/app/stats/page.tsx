import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Statistics" };

export default function StatsPage() {
  return (
    <PlaceholderPage
      title="Statistics"
      description="Crunched up numbers about this site and what I've been building."
    />
  );
}
