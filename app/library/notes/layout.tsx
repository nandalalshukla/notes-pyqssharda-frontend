import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Sharda University Notes — Semester Study Notes",
  description:
    "Browse and search Sharda University notes by course code, semester and unit. Sign in when you open a specific note.",
  alternates: { canonical: "/library/notes" },
  openGraph: {
    title: "Sharda University Notes — Semester Study Notes",
    description:
      "Search Sharda University notes by course code and semester. Sign in to open an individual note.",
    url: "/library/notes",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Tells a crawler this page is a collection of study material about
          Sharda University, and gives it a breadcrumb trail to show in
          results instead of a bare URL. */}
      <JsonLd
        data={[
          collectionSchema({
            name: "Sharda University Semester Notes",
            description:
              "Unit-wise study notes for Sharda University courses, shared by students and organised by course code and semester.",
            path: "/library/notes",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
            { name: "Notes", path: "/library/notes" },
          ]),
        ]}
      />
      {children}
    </>
  );
}
