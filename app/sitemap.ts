import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, absoluteUrl } from "@/lib/seo/site";
import { blogArticles } from "@/lib/blog";

// Only public, canonical landing pages and articles belong in this sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PUBLIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...blogArticles.map((article) => ({
      url: absoluteUrl(`/blogs/${article.slug}`),
      lastModified: new Date(article.updated),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
