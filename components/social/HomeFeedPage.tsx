import { Suspense } from "react";
import { Feed } from "@/components/social";
import { FeedLoadingState } from "@/components/social/LoadingSkeletons";

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
      {/* A single compact heading. Every page needs an h1 for search and for
          screen-reader navigation, but this one stays out of the way rather
          than pushing the feed below the fold. */}
      <header className="mx-auto max-w-3xl px-4 pb-2 pt-7 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Sharda Social
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          The Sharda University social media community for campus updates,
          events, opportunities, conversations and student life.
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
