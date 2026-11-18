import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthStatus, safeReturnTo } from "@/lib/server/auth";

/**
 * Metadata shared by every /library route.
 *
 * Deliberately carries no JSON-LD: a layout wraps its nested routes, so
 * structured data emitted here would also appear on /library/pyqs and
 * friends, giving those pages two conflicting CollectionPage descriptions.
 * The index page's own schema lives in its page.tsx instead.
 */
export const metadata: Metadata = {
  title: "Sharda Library & E-Library — Notes, PYQs & Syllabus",
  description:
    "The free Sharda library and e-library: find Sharda University previous year question papers, semester notes and syllabus PDFs by course code, semester or programme.",
  alternates: { canonical: "/library" },
  openGraph: {
    title: "Sharda Library & E-Library — Notes, PYQs & Syllabus",
    description:
      "Find previous year question papers, semester notes and syllabus PDFs for Sharda University in one searchable online library.",
    url: "/library",
    type: "website",
    images: ["/shardasocial.png"],
  },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const returnTo = safeReturnTo(requestHeaders.get("x-app-pathname"));
  const status = await getServerAuthStatus();

  if (status === "unavailable") {
    throw new Error("Authentication service is temporarily unavailable.");
  }

  if (status === "unauthenticated") {
    redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  }

  return <>{children}</>;
}
