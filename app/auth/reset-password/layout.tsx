import { Metadata } from "next";

export const metadata: Metadata = {
  // Private or single-purpose screens: nothing here belongs in
  // search results, and indexing them would spend crawl budget on pages
  // no one searches for.
  robots: { index: false, follow: false },
  title: "Reset Password",
  description: "Set a new password for your account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
