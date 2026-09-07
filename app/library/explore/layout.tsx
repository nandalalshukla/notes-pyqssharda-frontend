import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Search the Sharda Online Library",
  description:
    "Search across every Sharda University past paper, note and syllabus in one place. Find study material by subject, course code, semester or programme.",
  alternates: { canonical: "/library/explore" },
  openGraph: {
    title: "Search the Sharda Online Library",
    description:
      "Search across every Sharda University past paper, note and syllabus in one place. Find study material by subject, course code, semester or programme.",
    url: "/library/explore",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

export default function ExploreLayout({
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
            name: "Search the Sharda Online Library",
            description:
              "A single search across Sharda University past papers, notes and syllabus documents.",
            path: "/library/explore",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
            { name: "Explore", path: "/library/explore" },
          ]),
        ]}
      />
      {children}
    </>
  );
}
