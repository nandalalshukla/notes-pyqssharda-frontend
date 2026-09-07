import type { MetadataRoute } from "next";
import { DISALLOWED_ROUTES, SITE_URL } from "@/lib/seo/site";

/**
 * robots.txt
 *
 * Private and duplicated areas are excluded rather than merely
 * noindex'd: keeping crawlers out of auth screens, dashboards and settings
 * spends the site's crawl budget on the library pages that can actually
 * rank, instead of on hundreds of variations nobody searches for.
 */
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
