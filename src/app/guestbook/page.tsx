import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Guest Book" };

export default function GuestbookPage() {
  return (
    <PlaceholderPage
      title="Guest Book"
      description="Leave me a message. A little wall of hellos — coming soon."
    />
  );
}
