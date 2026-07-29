import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Empty placeholder for now — kept out of the index until it has content.
export const metadata: Metadata = {
  title: "Guest Book",
  robots: { index: false, follow: true },
};

export default function GuestbookPage() {
  return (
    <PlaceholderPage
      title="Guest Book"
      description="Leave me a message. A little wall of hellos — coming soon."
    />
  );
}
