import { Suspense } from "react";
import { Feed } from "@/components/social";
import { FeedLoadingState } from "@/components/social/LoadingSkeletons";
import SiteAnalyticsSummary from "@/components/analytics/SiteAnalyticsSummary";

/**
 * The campus feed page body, shared by the home page and by /post/[postId].
 * A shared post opens as a modal *over this*, so the person lands in the
 * community rather than on a bare, dead-end page.
 *
 * Deliberately just the feed — see the note on app/page.tsx for why there is
 * no marketing hero above it.
 */
export default function HomeFeedPage() {
  return (
    <div className="bg-background">
      <SiteAnalyticsSummary />

      <div className="min-h-[62vh]">
        <Suspense
          fallback={
            <div
              aria-busy="true"
              aria-live="polite"
              className="mx-auto min-h-[62vh] max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
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
