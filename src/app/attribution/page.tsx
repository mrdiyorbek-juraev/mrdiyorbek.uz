import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Attribution" };

export default function AttributionPage() {
  return (
    <PlaceholderPage
      title="Attribution"
      description="The journey to create this site — tools, inspiration, and credits."
    />
  );
}
