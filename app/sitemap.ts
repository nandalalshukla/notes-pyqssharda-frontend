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
 * Individual papers aren't listed. They're PDFs on Cloudinary rather than
 * pages on this site, so the thing to get indexed is the library section
 * that lists and filters them.
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
