import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PYQs (Previous Year Questions)",
  description: "Find past year question papers for your exams.",
};

export default function PYQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
