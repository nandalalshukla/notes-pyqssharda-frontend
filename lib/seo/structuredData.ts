import {
  ORGANISATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./site";

/** Schema descriptions must match the visible content and actual ownership. */
type Json = Record<string, unknown>;

// An independent student project, with no claimed university parent entity.
export function organisationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organisation`,
    name: ORGANISATION.name,
    alternateName: ["Sharda Social", "Sharda Online Library"],
    url: ORGANISATION.url,
    logo: {
      "@type": "ImageObject",
      url: ORGANISATION.logo,
    },
    description: SITE_DESCRIPTION,
    areaServed: {
      "@type": "Place",
      name: ORGANISATION.areaServed,
    },
  };
}

// WebSite describes the site name and publisher; no search-box promise.
export function webSiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organisation` },
  };
}

/**
 * A trail of ancestors for the current page, which Google renders in place
 * of the raw URL in a result.
 */
export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * A library section — a collection of study material rather than an
 * article. `CollectionPage` + `about` is what tells a crawler this page
 * lists many works on a subject.
 */
export function collectionSchema(opts: {
  name: string;
  description: string;
  path: string;
  /** Roughly how many items the section holds, when known. */
  itemCount?: number;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(opts.path)}#collection`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en-IN",
    about: {
      "@type": "CollegeOrUniversity",
      name: "Sharda University",
    },
    ...(opts.itemCount
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: opts.itemCount,
            itemListOrder: "https://schema.org/ItemListOrderDescending",
          },
        }
      : {}),
  };
}

/**
 * Questions and answers as they appear on the page.
 *
 * Only ever built from copy that is actually visible to a visitor —
 * marking up answers a human can't see is exactly what Google's structured
 * data guidelines forbid, and it risks a manual action rather than a rich
 * result.
 */
export function faqSchema(faqs: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
