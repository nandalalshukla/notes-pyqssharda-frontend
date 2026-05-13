import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore notes, PYQs, and other resources.",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
