import { Metadata } from "next";

export const metadata: Metadata = {
  // Private or single-purpose screens: nothing here belongs in
  // search results, and indexing them would spend crawl budget on pages
  // no one searches for.
  robots: { index: false, follow: false },
  title: "Login",
  description: "Log in to your Sharda Social account.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
