import type { Metadata } from "next";
import { Suspense } from "react";
import HomeFeedPage from "@/components/social/HomeFeedPage";
import LegacyPostLink from "@/components/social/LegacyPostLink";
import { SITE_DESCRIPTION } from "@/lib/seo/site";

/**
 * Home — the campus feed.
 *
 * Deliberately just the feed. An earlier version opened with a marketing
 * hero, three explainer cards and an FAQ before a student reached a single
 * post; for a social site that's the wrong first screen, so the copy moved
 * to where it belongs — the library sections describe themselves, and the
 * FAQ now lives on /about-us where it is still visible (which its FAQPage
 * structured data requires; marking up answers a reader can't see is
 * against Google's guidelines).
 *
 * What the page still needs for search is carried without cluttering it:
 * the title and description below, the site-wide Organisation and WebSite
 * schema in the root layout, the descriptive internal links in the footer,
 * and the library promo the feed slots between posts.
 */

export const metadata: Metadata = {
  // The one page that shouldn't use the "%s | Sharda Social" template —
  // a homepage title reads better leading with the brand, and this is the
  // title that has to win the query "sharda social".
  title: {
    absolute:
      "Sharda Social — Sharda University Notes, PYQs, Syllabus & Student Community",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function ShardaSocialHome() {
  return (
    <>
      <HomeFeedPage />
      {/* Opens `/?postId=<id>` links — the format post links had before
          posts got their own /post/<id> address. Its own Suspense boundary
          because reading the query string would otherwise de-optimise the
          whole page. */}
      <Suspense fallback={null}>
        <LegacyPostLink />
      </Suspense>
    </>
  );
}
