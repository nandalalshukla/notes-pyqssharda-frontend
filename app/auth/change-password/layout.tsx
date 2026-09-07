import { Metadata } from "next";

export const metadata: Metadata = {
  // Private or single-purpose screens: nothing here belongs in
  // search results, and indexing them would spend crawl budget on pages
  // no one searches for.
  robots: { index: false, follow: false },
  title: "Change Password",
  description: "Change your account password.",
};

export default function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
