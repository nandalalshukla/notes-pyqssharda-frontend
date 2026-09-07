import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

/**
 * Web app manifest.
 *
 * Makes the site installable and is one of the things Lighthouse checks
 * under "Best Practices" / PWA — both of which feed the overall quality
 * picture a search engine builds of a domain.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["education", "social", "books"],
    icons: [
      { src: "/shardasocial.png", sizes: "192x192", type: "image/png" },
      { src: "/shardasocial.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
