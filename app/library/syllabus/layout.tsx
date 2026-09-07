import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Sharda University Syllabus — Course Unit Breakdown",
  description:
    "Sharda University syllabus PDFs for every course, with the full unit-wise breakdown so you know exactly what is examinable this semester.",
  alternates: { canonical: "/library/syllabus" },
  openGraph: {
    title: "Sharda University Syllabus — Course Unit Breakdown",
    description:
      "Sharda University syllabus PDFs for every course, with the full unit-wise breakdown so you know exactly what is examinable this semester.",
    url: "/library/syllabus",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

export default function SyllabusLayout({
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
            name: "Sharda University Syllabus",
            description:
              "Official unit-wise syllabus documents for Sharda University courses.",
            path: "/library/syllabus",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
            { name: "Syllabus", path: "/library/syllabus" },
          ]),
        ]}
      />
      {children}
    </>
  );
}
