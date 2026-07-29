import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Empty placeholder for now — kept out of the index until it has content.
export const metadata: Metadata = {
  title: "Bucket List",
  robots: { index: false, follow: true },
};

export default function BucketListPage() {
  return (
    <PlaceholderPage
      title="Bucket List"
      description="Things to do at least once in life. A running list I keep adding to."
    />
  );
}
