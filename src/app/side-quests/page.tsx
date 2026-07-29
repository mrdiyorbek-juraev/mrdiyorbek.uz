import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Empty placeholder for now — kept out of the index until it has content.
export const metadata: Metadata = {
  title: "Side Quests",
  robots: { index: false, follow: true },
};

export default function SideQuestsPage() {
  return (
    <PlaceholderPage
      title="Side Quests"
      description="New skills and adventures I'm picking up outside the main path."
    />
  );
}
