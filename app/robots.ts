import type { MetadataRoute } from "next";
import { DISALLOWED_ROUTES, SITE_URL } from "@/lib/seo/site";

// Keep HTML crawlable so crawlers can read page-level noindex directives.
// API responses are not search landing pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_ROUTES,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
