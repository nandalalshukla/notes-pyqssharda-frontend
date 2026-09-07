import type { Metadata } from "next";

/**
 * Member profiles are crawlable but not indexed.
 *
 * `follow` keeps the links out of a dead end — a crawler still discovers
 * the posts and uploads linked from a profile — while `noindex` keeps
 * thousands of near-identical, mostly-empty member pages out of the index.
 * Thin duplicated pages drag down how a search engine rates the domain as
 * a whole, which would work against the library pages that should rank.
 */
export const metadata: Metadata = {
  title: "Student Profile",
  description: "A Sharda Social member profile.",
  robots: { index: false, follow: true },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
