import { Metadata } from "next";

export const metadata: Metadata = {
  // Private or single-purpose screens: nothing here belongs in
  // search results, and indexing them would spend crawl budget on pages
  // no one searches for.
  robots: { index: false, follow: false },
  title: "Dashboard",
  description: "Manage your profile and contributions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
