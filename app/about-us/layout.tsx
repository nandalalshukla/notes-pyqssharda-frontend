import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about the Sharda Social community.",
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
