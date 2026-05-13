import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syllabus",
  description: "View the syllabus for your courses at Sharda University.",
};

export default function SyllabusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
