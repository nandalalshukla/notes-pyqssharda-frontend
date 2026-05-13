import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "Access the best notes for Sharda University exams.",
};

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
