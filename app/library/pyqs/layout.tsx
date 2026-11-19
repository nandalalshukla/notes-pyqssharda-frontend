import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sharda University Previous Year Question Papers (PYQs)",
  description:
    "Browse and search Sharda University previous year question papers by programme, semester, year or course code. Sign in to open a paper.",
  alternates: { canonical: "/library/pyqs" },
  openGraph: {
    title: "Sharda University Previous Year Question Papers (PYQs)",
    description:
      "Search Sharda University previous year question papers by programme, semester, year or course code. Sign in to open a paper.",
    url: "/library/pyqs",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

/**
 * Metadata for the PYQs section.
 *
 * No JSON-LD here: a layout wraps its children, so a CollectionPage and
 * breadcrumb trail emitted at this level would also attach to each
 * individual paper page and describe it as the section listing. The list
 * page carries its own instead.
 */
export default function PYQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
