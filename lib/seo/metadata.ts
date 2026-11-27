import type { Metadata } from "next";
import { IS_PREVIEW } from "./site";

export const publicRobots: Metadata["robots"] = {
  index: !IS_PREVIEW,
  follow: true,
  googleBot: { index: !IS_PREVIEW, follow: true, "max-image-preview": "large", "max-snippet": -1 },
};

export const privateRobots: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    robots: publicRobots,
    openGraph: { title, description, url: path, type: "website", images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
