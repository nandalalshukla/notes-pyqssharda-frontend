import type { Metadata } from "next";

/**
 * The services pages are interactive, signed-in forms, so every page below is
 * a client component and can't export `metadata` itself. This layout carries
 * the shared head for the whole section.
 *
 * `robots: noindex` is deliberate: these pages are wallets, paid forms and a
 * student's own generated documents. There is nothing here for a search engine
 * to index and good reason not to have generated coursework surfacing in
 * results.
 */
export const metadata: Metadata = {
  title: {
    default: "Services — Sharda Social",
    template: "%s — Sharda Social Services",
  },
  description:
    "Build a resume, generate an internship or project report, put together a presentation, or get a custom project built — all in your own department's format.",
  robots: { index: false, follow: false },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
