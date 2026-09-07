/**
 * One place for everything the site says about itself.
 *
 * Metadata, structured data, the sitemap and robots.txt all read from here,
 * so the canonical URL, the name and the description can't drift apart
 * between the <head>, the JSON-LD and the sitemap — which is exactly the
 * kind of inconsistency that makes a crawler distrust a site.
 */

/**
 * The public origin, with no trailing slash.
 *
 * Set NEXT_PUBLIC_SITE_URL in production. The Vercel fallback keeps preview
 * deployments self-consistent rather than pointing their canonicals at the
 * production domain, which would ask Google to index a preview build.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://notes-pyqssharda.vercel.app")
).replace(/\/+$/, "");

export const SITE_NAME = "Sharda Social";

export const SITE_TAGLINE =
  "The student social network and online library for Sharda University";

/**
 * The default description. Written to read as a sentence a person would
 * find useful in a search result, not as a keyword list — Google ranks the
 * page, but a human decides whether to click it.
 */
export const SITE_DESCRIPTION =
  "Sharda Social is the student community and free online library for Sharda University — thousands of previous year question papers, semester notes and syllabus PDFs, plus a campus feed for announcements, events and lost & found.";

/**
 * Terms this site is genuinely about. Kept honest: the `keywords` meta tag
 * carries no ranking weight with Google any more, and stuffing it with
 * terms the pages don't actually serve is a quality signal in the wrong
 * direction. These exist to guide the copy, and are emitted because other
 * engines (Bing, DuckDuckGo) still read them.
 */
export const SITE_KEYWORDS = [
  "Sharda Social",
  "Sharda University",
  "Sharda University past year questions",
  "Sharda University previous year question papers",
  "Sharda University notes",
  "Sharda University syllabus",
  "Sharda online library",
  "Sharda University PYQ",
  "Sharda University study material",
  "Sharda University Greater Noida",
  "SET Sharda",
  "B.Tech CSE previous year papers",
];

export const ORGANISATION = {
  name: SITE_NAME,
  legalName: "Sharda Social",
  url: SITE_URL,
  logo: `${SITE_URL}/shardasocial.png`,
  areaServed: "Sharda University, Greater Noida, Uttar Pradesh, India",
};

/** Absolute URL for a path — structured data and OG tags require absolute. */
export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * The routes worth putting in front of a crawler, with the relative
 * priority and change frequency each one deserves.
 *
 * Auth screens, dashboards, settings and individual profiles are
 * deliberately absent: they're either private, duplicated across users, or
 * thin — all three dilute a site's crawl budget and its quality signals.
 */
export const PUBLIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/library", priority: 0.9, changeFrequency: "weekly" },
  { path: "/library/pyqs", priority: 0.9, changeFrequency: "weekly" },
  { path: "/library/notes", priority: 0.8, changeFrequency: "weekly" },
  { path: "/library/syllabus", priority: 0.8, changeFrequency: "weekly" },
  { path: "/library/explore", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about-us", priority: 0.5, changeFrequency: "monthly" },
];

/**
 * Paths robots.txt blocks from being *crawled*.
 *
 * Deliberately short. Blocking a page in robots.txt and also giving it a
 * `noindex` tag is self-defeating: a crawler that is forbidden to fetch the
 * page never reads the tag, so the URL can still surface in results as a
 * bare link with no description.
 *
 * So HTML pages that shouldn't rank — auth screens, dashboards, settings,
 * member profiles — are left crawlable and carry `robots: { index: false }`
 * in their own metadata instead, which reliably removes them. Only routes
 * that serve no indexable HTML at all are listed here.
 */
export const DISALLOWED_ROUTES = ["/api/"];
