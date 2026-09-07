import {
  ORGANISATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./site";

/**
 * Schema.org JSON-LD builders.
 *
 * Structured data is how a search engine learns what a page *is* rather
 * than guessing from its text: it's what makes a site eligible for the
 * sitelinks search box, breadcrumb trails in results, and FAQ rich
 * results. Every builder here returns a plain object that gets serialised
 * into a <script type="application/ld+json">.
 */

type Json = Record<string, unknown>;

/**
 * The publisher. `EducationalOrganization` rather than plain
 * `Organization` because that's what this is — a student library for one
 * named university — and the more specific type is what lets Google
 * connect the site to the institution it serves.
 */
export function organisationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
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
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Sharda University",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Greater Noida",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
    },
  };
}

/**
 * The site itself, plus the search action.
 *
 * `potentialAction` is what makes Google offer a search box directly under
 * the result for a branded query like "sharda social" — the query is
 * handed to /library/explore, which is the page that can actually answer
 * it.
 */
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/library/explore?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
