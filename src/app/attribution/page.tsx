import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Empty placeholder for now — kept out of the index until it has content.
export const metadata: Metadata = {
  title: "Attribution",
  robots: { index: false, follow: true },
};

export default function AttributionPage() {
  return (
    <PlaceholderPage
      title="Attribution"
      description="The journey to create this site — tools, inspiration, and credits."
    />
  );
}
