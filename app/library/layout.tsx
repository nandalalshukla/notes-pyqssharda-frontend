import type { Metadata } from "next";

/**
 * Metadata shared by every /library route.
 *
 * Deliberately carries no JSON-LD: a layout wraps its nested routes, so
 * structured data emitted here would also appear on /library/pyqs and
 * friends, giving those pages two conflicting CollectionPage descriptions.
 * The index page's own schema lives in its page.tsx instead.
 */
export const metadata: Metadata = {
  title: "Sharda Online Library — Notes, PYQs & Syllabus",
  description:
    "The free Sharda online library: previous year question papers, semester notes and syllabus PDFs for every school at Sharda University, Greater Noida. Search by course code, semester or programme.",
  alternates: { canonical: "/library" },
  openGraph: {
    title: "Sharda Online Library — Notes, PYQs & Syllabus",
    description:
      "Previous year question papers, semester notes and syllabus PDFs for every school at Sharda University, Greater Noida.",
    url: "/library",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
