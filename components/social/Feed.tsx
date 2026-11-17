"use client";

import React, { useEffect, useState, useRef } from "react";
import { Fragment } from "react";
import dynamic from "next/dynamic";
import { Menu, Transition } from "@headlessui/react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import PostCard from "./PostCard";
import PostHoverList from "./PostHoverList";
import InFeedLibraryPromo from "./InFeedLibraryPromo";
import { FeedLoadingState, PostCardSkeleton } from "./LoadingSkeletons";

// Only rendered after clicking "New Post" — keep it out of the initial bundle.
const CreatePostModal = dynamic(() => import("./CreatePostModal"));
import { FiPlus, FiFileText, FiSliders } from "react-icons/fi";
import { LostFoundStatus, PostType } from "@/lib/api/social/social.api";
import { postTypeOptions, resolvePostTypeMeta } from "./postMeta";
import { Button, EmptyState } from "@/components/ui";

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

/**
 * Where the library promo appears among the posts.
 *
 * Exactly once, after the third post. Not at the very top — a feed that
 * opens with a promo reads as an advert rather than a feed — and not
 * repeated, because a promo a reader has already scrolled past stops being
 * a prompt and starts being clutter.
 */
const PROMO_AFTER_POST = 3;

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
  const [lostFoundFilter, setLostFoundFilter] =
    useState<LostFoundFilter>("all");
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(false);

  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const isLostFoundSection = activeSection === "lost_found";
  const isOpportunitySection = activeSection === "opportunity";
  // The filter only applies to the lost & found board; leaving a stale
  // "resolved" selection applied to a section switch would silently return
  // nothing, so anywhere else it resolves back to "all".
  const effectiveLostFoundFilter: LostFoundFilter = isLostFoundSection
    ? lostFoundFilter
    : "all";

  const hasMore = feedTotalPages > currentPage;
  const isLoadingMore = isLoadingFeed && currentPage > 1;
  const shouldShowFeedSkeleton = isLoadingFeed && feed.length === 0;
  const shouldShowEmptyState =
    !isLoadingFeed && feed.length === 0 && hasAttemptedInitialLoad;

  const selectSection = (section: PostType) => {
    if (section !== activeSection) setCurrentPage(1);
    setActiveSection(section);
  };

  const selectLostFoundFilter = (filter: LostFoundFilter) => {
    if (filter !== lostFoundFilter) setCurrentPage(1);
    setLostFoundFilter(filter);
  };

  useEffect(() => {
    if (!authInitialized) return;
    void fetchFeed(currentPage, activeSection, effectiveLostFoundFilter).finally(
      () => setHasAttemptedInitialLoad(true),
    );
  }, [
    authInitialized,
    isAuthenticated,
    activeSection,
    effectiveLostFoundFilter,
    currentPage,
    fetchFeed,
  ]);

  // Auth can change outside the feed (for example through the navbar).
  // Subscribe to that event and reset pagination without state changes in a
  // render effect, so a new account context always starts at the first page.
  useEffect(() => {
    let previousAuthState = useAuthStore.getState().isAuthenticated;
    return useAuthStore.subscribe((state) => {
      if (state.isAuthenticated === previousAuthState) return;
      previousAuthState = state.isAuthenticated;
      setCurrentPage(1);
    });
  }, []);

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
          solid background prevents posts from showing through while they
          scroll underneath. The sticky offset clears the navbar height. */}
      <div className="sticky top-[57px] z-20 border-b border-border/70 bg-background md:top-[61px]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              aria-pressed={activeSection === "general"}
              onClick={() => selectSection("general")}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                activeSection === "general"
                  ? "border-primary bg-primary text-primary-foreground shadow-soft-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              General
            </button>

            <div className="hidden min-w-0 items-center gap-2 md:flex">
              {feedSections
                .filter((section) => section.value !== "general")
                .map((section) => {
                  const selected = activeSection === section.value;
                  return (
                    <button
                      key={section.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectSection(section.value)}
                      className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-soft-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {section.label}
                    </button>
                  );
                })}
            </div>

            <Menu as="div" className="relative md:hidden">
              <Menu.Button
                aria-label={
                  activeSection === "general"
                    ? "More feed filters"
                    : `${resolvePostTypeMeta(activeSection).tabLabel} filter selected. Open filters`
                }
                className="relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <FiSliders size={15} />
                Filters
                {activeSection !== "general" && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-2xl border border-border bg-card p-1.5 shadow-soft-lg focus:outline-none">
                  <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                    Feed sections
                  </p>
                  {feedSections.map((section) => {
                    const selected = activeSection === section.value;
                    return (
                      <Menu.Item key={section.value}>
                        {({ active }) => (
                          <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() => selectSection(section.value)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                              selected
                                ? "bg-primary/10 text-primary"
                                : active
                                  ? "bg-secondary text-foreground"
                                  : "text-foreground"
                            }`}
                          >
                            {section.label}
                            {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </button>
                        )}
                      </Menu.Item>
                    );
                  })}
                  {isLostFoundSection && (
                    <>
                      <div className="my-1.5 border-t border-border" />
                      <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                        Item status
                      </p>
                      {lostFoundFilters.map((filter) => {
                        const selected = lostFoundFilter === filter.value;
                        return (
                          <Menu.Item key={filter.value}>
                            {({ active }) => (
                              <button
                                type="button"
                                aria-pressed={selected}
                                onClick={() => selectLostFoundFilter(filter.value)}
                                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                                  selected
                                    ? "bg-primary/10 text-primary"
                                    : active
                                      ? "bg-secondary text-foreground"
                                      : "text-foreground"
                                }`}
                              >
                                {filter.label}
                                {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                              </button>
                            )}
                          </Menu.Item>
                        );
                      })}
                    </>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {isAuthenticated && (
            <Button
              onClick={() => setShowCreateModal(true)}
              icon={<FiPlus size={18} />}
              className="shrink-0"
            >
              <span className="hidden sm:inline">New Post</span>
            </Button>
          )}
        </div>

        {/* On desktop the Lost & Found status is a compact secondary pill row;
            on mobile the same options live in the Filters menu above. */}
        {isLostFoundSection && (
          <div className="mx-auto hidden max-w-4xl flex-wrap items-center gap-2 px-4 pb-3 sm:px-6 md:flex lg:px-8">
            {lostFoundFilters.map((filter) => {
              const selected = lostFoundFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectLostFoundFilter(filter.value)}
                  className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
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
      <div className="mx-auto min-h-[65vh] max-w-4xl space-y-2 px-4 py-6 sm:px-6 lg:px-8">
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
        {shouldShowFeedSkeleton ? (
          <div className="min-h-[60vh]">
            <FeedLoadingState />
          </div>
        ) : feed.length > 0 ? (
          <>
            {/* Posts Grid, with a library promo slotted in the way a
                social feed slots in an ad. */}
            <PostHoverList className="space-y-1">
              {feed.map((post, index) => (
                <React.Fragment key={post._id}>
                  <PostCard
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

                  {/* Once, after the third post — or after the last one
                      when a filtered feed is shorter than that, so a
                      two-post Lost & Found tab still shows it. */}
                  {index ===
                    Math.min(PROMO_AFTER_POST - 1, feed.length - 1) && (
                    <div className="py-2">
                      <InFeedLibraryPromo className="animate-fade-in" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </PostHoverList>

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
        ) : shouldShowEmptyState ? (
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
                : isOpportunitySection
                  ? "Share jobs, internships, collaborations and other openings with the community."
                : "Be the first to share something with the community!"
            }
            action={
              isAuthenticated && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  icon={<FiPlus size={18} />}
                >
                  {isLostFoundSection
                    ? "Post an Item"
                    : isOpportunitySection
                      ? "Share Opportunity"
                      : "Create First Post"}
                </Button>
              )
            }
          />
        ) : null}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
