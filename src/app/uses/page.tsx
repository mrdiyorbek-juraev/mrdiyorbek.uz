import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Empty placeholder for now — kept out of the index until it has content.
export const metadata: Metadata = {
  title: "Uses",
  robots: { index: false, follow: true },
};

export default function UsesPage() {
  return (
    <PlaceholderPage
      title="Uses"
      description="A peek into my digital workspace — the hardware, apps, and tools I rely on."
    />
  );
}
