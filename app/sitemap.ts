import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, absoluteUrl } from "@/lib/seo/site";

/**
 * sitemap.xml
 *
 * Lists only the public, indexable routes — the same set robots.txt
 * allows. A sitemap that contradicts robots.txt (by listing pages the
 * crawler is told not to fetch) is a trust problem, so both read from the
 * one list in lib/seo/site.ts.
 *
 * Individual papers aren't listed here yet. Each one now has its own page
 * (/library/pyqs/[id]), and those are indexable and internally linked from
 * the listing — but there are ~5,700 of them, and a sitemap that large is
 * better generated in pages of 5,000 (the spec's limit) from the database
 * than inlined here. The section pages are enough for discovery in the
 * meantime, since every paper is one click from them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
