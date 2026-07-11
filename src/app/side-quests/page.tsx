import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Side Quests" };

export default function SideQuestsPage() {
  return (
    <PlaceholderPage
      title="Side Quests"
      description="New skills and adventures I'm picking up outside the main path."
    />
  );
}
