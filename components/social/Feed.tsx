"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import PostCard from "./PostCard";
import { FeedLoadingState, PostCardSkeleton } from "./LoadingSkeletons";

// Only rendered after clicking "New Post" — keep it out of the initial bundle.
const CreatePostModal = dynamic(() => import("./CreatePostModal"));
import { FiPlus, FiStar, FiFileText } from "react-icons/fi";
import { LostFoundStatus, PostType } from "@/lib/api/social/social.api";
import { postTypeOptions, resolvePostTypeMeta } from "./postMeta";
import { Button, EmptyState, Tabs } from "@/components/ui";

const feedSections = postTypeOptions.map((meta) => ({
  value: meta.value,
  label: meta.tabLabel,
  empty: meta.emptyTitle,
  icon: meta.Icon,
}));

/** The lost & found board's secondary filter — hidden on every other section. */
type LostFoundFilter = LostFoundStatus | "all";

const lostFoundFilters: { value: LostFoundFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Still open" },
  { value: "resolved", label: "Resolved" },
];

export default function Feed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authInitialized = useAuthStore((s) => s.authInitialized);
  const feed = useSocialStore((s) => s.feed);
  const feedTotalPages = useSocialStore((s) => s.feedTotalPages);
  const isLoadingFeed = useSocialStore((s) => s.isLoadingFeed);
  const fetchFeed = useSocialStore((s) => s.fetchFeed);
  const error = useSocialStore((s) => s.error);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] = useState<PostType>("general");
  const [lostFoundFilter, setLostFoundFilter] = useState<LostFoundFilter>("all");

  const previousAuthState = useRef<boolean | null>(null);
  const previousSection = useRef<PostType>("general");
  const previousLostFoundFilter = useRef<LostFoundFilter>("all");
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const isLostFoundSection = activeSection === "lost_found";
  // The filter only applies to the lost & found board; leaving a stale
  // "resolved" selection applied to a section switch would silently return
  // nothing, so anywhere else it resolves back to "all".
  const effectiveLostFoundFilter: LostFoundFilter = isLostFoundSection
    ? lostFoundFilter
    : "all";

  const hasMore = feedTotalPages > currentPage;
  const isLoadingMore = isLoadingFeed && currentPage > 1;

  useEffect(() => {
    if (!authInitialized) return;

    // Changing section or the lost & found filter is a new list, not more
    // of the current one — reset to page 1 first and let the reset's own
    // render do the fetching, so an in-flight page 3 can't append rows
    // from the section the user just left.
    if (
      previousSection.current !== activeSection ||
      previousLostFoundFilter.current !== effectiveLostFoundFilter
    ) {
      previousSection.current = activeSection;
      previousLostFoundFilter.current = effectiveLostFoundFilter;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    if (previousAuthState.current === null) {
      previousAuthState.current = isAuthenticated;
      fetchFeed(currentPage, activeSection, effectiveLostFoundFilter);
      return;
    }

    if (previousAuthState.current !== isAuthenticated) {
      previousAuthState.current = isAuthenticated;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    fetchFeed(currentPage, activeSection, effectiveLostFoundFilter);
  }, [
    authInitialized,
    isAuthenticated,
    activeSection,
    effectiveLostFoundFilter,
    currentPage,
    fetchFeed,
  ]);

  // Auto-load the next page as the bottom of the feed approaches the
  // viewport, instead of requiring a manual "Load More" click — the
  // `rootMargin` fires this ~400px before the sentinel is actually on
  // screen, so the next page is usually ready before the user reaches it.
  useEffect(() => {
    const node = loadMoreSentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingFeed) {
          setCurrentPage((page) => page + 1);
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingFeed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header — just the section pills + new-post action. No
          border/shadow of its own: the site navbar above already draws its
          own edge on scroll, and adding a second one here framed the pills
          row with a line above AND below it. `top` is offset by the site
          navbar's own height (61px mobile / 81px desktop, matching its
          `md:` breakpoint) — both this and the navbar are `sticky top-0`,
          so without the offset they'd pin to the same spot and this bar
          would render hidden behind the navbar's higher z-index. */}
      <div className="sticky top-[61px] z-10 bg-background/90 backdrop-blur-xl md:top-[81px]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Tabs
            items={feedSections.map((s) => ({ value: s.value, label: s.label, icon: s.icon }))}
            value={activeSection}
            onChange={setActiveSection}
            className="flex-1"
          />
          {isAuthenticated && (
            <Button onClick={() => setShowCreateModal(true)} icon={<FiPlus size={18} />}>
              <span className="hidden sm:inline">New Post</span>
            </Button>
          )}
        </div>

        {/* Lost & found board sub-filter. Rendered as a second row rather
            than merged into the section pills so the two stay clearly
            different choices: which board, then which slice of it. */}
        {isLostFoundSection && (
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 pb-4 sm:px-6 lg:px-8">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Show
            </span>
            {lostFoundFilters.map((filter) => {
              const selected = lostFoundFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLostFoundFilter(filter.value)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Auth Prompt */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent-purple/10 p-8 text-center shadow-soft-sm">
            <div className="mb-4 flex items-center justify-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                <FiStar size={32} className="text-primary" />
              </div>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Sign in to share your thoughts
            </h2>
            <p className="text-sm text-muted-foreground">
              Create posts, comment, and connect with your community
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center shadow-soft-sm">
            <p className="mb-1 font-semibold text-destructive">
              Something went wrong
            </p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoadingFeed && feed.length === 0 ? (
          <FeedLoadingState />
        ) : feed.length > 0 ? (
          <>
            {/* Posts Grid */}
            <div className="space-y-5">
              {feed.map((post, index) => (
                <PostCard
                  key={post._id}
                  post={post}
                  className="animate-fade-in"
                  style={{
                    // Capped so a batch of newly-appended posts staggers in
                    // quickly (instead of the delay growing unbounded with
                    // the feed's total length — post #50 waiting 2.5s to
                    // fade in reads as broken, not smooth).
                    animationDelay: `${Math.min(index, 9) * 0.04}s`,
                  }}
                />
              ))}
            </div>

            {/* Infinite-scroll sentinel — auto-loads the next page on
                approach; shows a skeleton while that page is in flight, or
                the "caught up" message once there's nothing left to load. */}
            <div ref={loadMoreSentinelRef}>
              {isLoadingMore && (
                <div className="animate-fade-in">
                  <PostCardSkeleton />
                </div>
              )}
              {!hasMore && !isLoadingMore && (
                <div className="animate-fade-in rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-soft-sm">
                  <p className="mb-1 font-semibold text-foreground">
                    You&apos;re all caught up
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for more posts from the community
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <EmptyState
            icon={<FiFileText size={32} />}
            title={
              isLostFoundSection && lostFoundFilter !== "all"
                ? lostFoundFilter === "open"
                  ? "Nothing open right now"
                  : "Nothing resolved yet"
                : resolvePostTypeMeta(activeSection).emptyTitle
            }
            description={
              isLostFoundSection
                ? "Lost something on campus, or found something that isn't yours? Post it here."
                : "Be the first to share something with the community!"
            }
            action={
              isAuthenticated && (
                <Button onClick={() => setShowCreateModal(true)} icon={<FiPlus size={18} />}>
                  {isLostFoundSection ? "Post an Item" : "Create First Post"}
                </Button>
              )
            }
          />
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
