import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Uses" };

export default function UsesPage() {
  return (
    <PlaceholderPage
      title="Uses"
      description="A peek into my digital workspace — the hardware, apps, and tools I rely on."
    />
  );
}
