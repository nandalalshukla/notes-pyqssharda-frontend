"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { FeedLoadingState } from "./LoadingSkeletons";
import {
  FiPlus,
  FiStar,
  FiFileText,
  FiMessageSquare,
  FiBell,
  FiCalendar,
} from "react-icons/fi";
import { PostType } from "@/lib/api/social/social.api";

const feedSections: {
  value: PostType;
  label: string;
  empty: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    value: "general",
    label: "General",
    empty: "No posts yet",
    Icon: FiMessageSquare,
  },
  {
    value: "announcement",
    label: "Announcements",
    empty: "No announcements yet",
    Icon: FiBell,
  },
  {
    value: "event",
    label: "Events",
    empty: "No events yet",
    Icon: FiCalendar,
  },
];

export default function Feed() {
  const { isAuthenticated, authInitialized } = useAuthStore();
  const { feed, feedPage, feedTotalPages, isLoadingFeed, fetchFeed, error } =
    useSocialStore();

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
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {feed.length > 0
                ? `${feed.length} posts${feedTotalPages > 1 ? ` (Page ${currentPage})` : ""}`
                : "No posts yet"}
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <FiPlus size={18} />
              <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {feedSections.map(({ value, label, Icon }) => {
            const selected = activeSection === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveSection(value)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Auth Prompt */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <FiStar size={32} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-blue-900 mb-1">
              Sign in to share your thoughts
            </h2>
            <p className="text-sm text-blue-700">
              Create posts, comment, and connect with your community
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
            <p className="text-red-900 font-semibold mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-red-700">{error}</p>
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
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingFeed}
                  className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoadingFeed ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Load More Posts"
                  )}
                </button>
              </div>
            )}

            {/* End of Feed Message */}
            {currentPage === feedTotalPages && feed.length > 0 && (
              <div className="text-center py-12 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-900 font-semibold mb-1">
                  You're all caught up
                </p>
                <p className="text-sm text-gray-500">
                  Check back later for more posts from the community
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
              <FiFileText size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {feedSections.find((section) => section.value === activeSection)
                ?.empty || "No posts yet"}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Be the first to share something with the community!
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <FiPlus size={18} />
                Create First Post
              </button>
            )}
          </div>
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
