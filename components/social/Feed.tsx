"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import PostCard from "./PostCard";
import { FeedLoadingState } from "./LoadingSkeletons";

// Only rendered after clicking "New Post" — keep it out of the initial bundle.
const CreatePostModal = dynamic(() => import("./CreatePostModal"));
import {
  FiPlus,
  FiStar,
  FiFileText,
  FiMessageSquare,
  FiBell,
  FiCalendar,
} from "react-icons/fi";
import { PostType } from "@/lib/api/social/social.api";
import { Button, EmptyState, Tabs } from "@/components/ui";

const feedSections: {
  value: PostType;
  label: string;
  empty: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    value: "general",
    label: "General",
    empty: "No posts yet",
    icon: FiMessageSquare,
  },
  {
    value: "announcement",
    label: "Announcements",
    empty: "No announcements yet",
    icon: FiBell,
  },
  {
    value: "event",
    label: "Events",
    empty: "No events yet",
    icon: FiCalendar,
  },
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

  const previousAuthState = useRef<boolean | null>(null);
  const previousSection = useRef<PostType>("general");

  useEffect(() => {
    if (!authInitialized) return;

    if (previousSection.current !== activeSection) {
      previousSection.current = activeSection;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    if (previousAuthState.current === null) {
      previousAuthState.current = isAuthenticated;
      fetchFeed(currentPage, activeSection);
      return;
    }

    if (previousAuthState.current !== isAuthenticated) {
      previousAuthState.current = isAuthenticated;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    fetchFeed(currentPage, activeSection);
  }, [authInitialized, isAuthenticated, activeSection, currentPage, fetchFeed]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < feedTotalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, feedTotalPages]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 shadow-soft-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Feed</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {feed.length > 0
                ? `${feed.length} posts${feedTotalPages > 1 ? ` (Page ${currentPage})` : ""}`
                : "No posts yet"}
            </p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setShowCreateModal(true)} icon={<FiPlus size={18} />}>
              <span className="hidden sm:inline">New Post</span>
            </Button>
          )}
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
          <Tabs
            items={feedSections.map((s) => ({ value: s.value, label: s.label, icon: s.icon }))}
            value={activeSection}
            onChange={setActiveSection}
          />
        </div>
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
                    animationDelay: `${index * 0.05}s`,
                  }}
                />
              ))}
            </div>

            {/* Load More Button */}
            {feedTotalPages > currentPage && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={handleLoadMore}
                  loading={isLoadingFeed}
                  size="lg"
                  className="px-8"
                >
                  Load More Posts
                </Button>
              </div>
            )}

            {/* End of Feed Message */}
            {currentPage === feedTotalPages && feed.length > 0 && (
              <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-soft-sm">
                <p className="mb-1 font-semibold text-foreground">
                  You&apos;re all caught up
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back later for more posts from the community
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <EmptyState
            icon={<FiFileText size={32} />}
            title={
              feedSections.find((section) => section.value === activeSection)
                ?.empty || "No posts yet"
            }
            description="Be the first to share something with the community!"
            action={
              isAuthenticated && (
                <Button onClick={() => setShowCreateModal(true)} icon={<FiPlus size={18} />}>
                  Create First Post
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
