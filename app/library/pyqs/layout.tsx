import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Sharda University Previous Year Question Papers (PYQs)",
  description:
    "Download Sharda University previous year question papers for every school and semester. Filter thousands of past exam papers by programme, semester, academic year or course code — free, no sign-up needed.",
  alternates: { canonical: "/library/pyqs" },
  openGraph: {
    title: "Sharda University Previous Year Question Papers (PYQs)",
    description:
      "Download Sharda University previous year question papers for every school and semester. Filter thousands of past exam papers by programme, semester, academic year or course code — free, no sign-up needed.",
    url: "/library/pyqs",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

export default function PYQsLayout({
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
            name: "Sharda University Previous Year Question Papers",
            description:
              "A searchable collection of previous year question papers from Sharda University, Greater Noida, covering every school and academic year.",
            path: "/library/pyqs",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Library", path: "/library" },
            { name: "PYQs", path: "/library/pyqs" },
          ]),
        ]}
      />
      {children}
    </>
  );
}
