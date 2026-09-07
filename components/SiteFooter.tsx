import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/site";

/**
 * Site footer.
 *
 * A server component with no client JavaScript, so its links are in the
 * HTML every crawler receives. That matters more than it looks: internal
 * links are how ranking signal reaches deeper pages, and before this the
 * only route to the library sections was a client-rendered navbar and a
 * few buttons on one page.
 *
 * The link text is the phrasing people actually search for ("Sharda
 * University previous year questions", not "PYQs") — descriptive anchor
 * text is one of the clearer signals about what a destination page covers.
 */

const LIBRARY_LINKS = [
  {
    href: "/library/pyqs",
    label: "Sharda University Previous Year Questions",
    short: "PYQs",
  },
  { href: "/library/notes", label: "Sharda University Notes", short: "Notes" },
  {
    href: "/library/syllabus",
    label: "Sharda University Syllabus",
    short: "Syllabus",
  },
  {
    href: "/library/explore",
    label: "Search the Sharda Online Library",
    short: "Explore",
  },
];

const COMMUNITY_LINKS = [
  { href: "/", label: "Campus Feed" },
  { href: "/library", label: "Online Library" },
  { href: "/about-us", label: "About Sharda Social" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-black text-foreground">{SITE_NAME}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              The student community and free online library for{" "}
              <strong className="font-semibold text-foreground">
                Sharda University, Greater Noida
              </strong>
              . Find previous year question papers, semester notes and
              syllabus PDFs shared by students, and keep up with campus
              announcements, events and lost &amp; found.
            </p>
          </div>

          <nav aria-label="Library">
            <h3 className="text-sm font-black tracking-wide text-foreground uppercase">
              Study Material
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LIBRARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Community">
            <h3 className="text-sm font-black tracking-wide text-foreground uppercase">
              Community
            </h3>
            <ul className="mt-4 space-y-2.5">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Built by students, for
            students.
          </p>
          <p className="mt-2">
            {SITE_NAME} is an independent student-run project and is not an
            official website of Sharda University. Study material is shared
            by students for revision purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
