import type { Metadata } from "next";

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
