import type { Metadata } from "next";
import { Suspense } from "react";
import { Feed } from "@/components/social";
import { FeedLoadingState } from "@/components/social/LoadingSkeletons";
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
    <div className="bg-background">
      {/* A single compact heading. Every page needs an h1 for search and
          for screen-reader navigation, but this one stays out of the way
          rather than pushing the feed below the fold. */}
      <header className="mx-auto max-w-3xl px-4 pb-2 pt-7 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Sharda Social
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Campus updates, events, and conversations from the Sharda community.
        </p>
      </header>

      <div className="min-h-[62vh]">
        <Suspense
          fallback={
            <div
              aria-busy="true"
              aria-live="polite"
              className="mx-auto min-h-[62vh] max-w-3xl px-4 py-6 sm:px-6 lg:px-8"
            >
              <FeedLoadingState />
            </div>
          }
        >
          <Feed />
        </Suspense>
      </div>
    </div>
  );
}
