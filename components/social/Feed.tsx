"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { FeedLoadingState } from "./LoadingSkeletons";
import { FiPlus } from "react-icons/fi";

export default function Feed() {
  const { isAuthenticated } = useAuthStore();
  const { feed, feedPage, feedTotalPages, isLoadingFeed, fetchFeed, error } =
    useSocialStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch feed on mount and when page changes
  useEffect(() => {
    fetchFeed(currentPage);
  }, [currentPage, fetchFeed]);

  // Refetch feed when user logs in/out to update like states
  useEffect(() => {
    fetchFeed(1);
    setCurrentPage(1);
  }, [isAuthenticated, fetchFeed]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < feedTotalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, feedTotalPages]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-950">
              Feed
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {feed.length > 0
                ? `${feed.length} posts${feedTotalPages > 1 ? ` (Page ${currentPage})` : ""}`
                : "No posts yet"}
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex items-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-950/20"
            >
              <FiPlus
                size={20}
                className="group-hover:rotate-90 transition-transform"
              />
              <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Auth Prompt */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="text-4xl">💭</div>
            </div>
            <p className="text-lg font-bold text-blue-900 mb-2">
              Sign in to share your thoughts
            </p>
            <p className="text-sm text-blue-700 mb-4">
              Create posts, comment, and connect with your community
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-900 font-semibold mb-2">
              ⚠️ Something went wrong
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
            <div className="space-y-6">
              {feed.map((post, index) => (
                <div
                  key={post._id}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {feedTotalPages > currentPage && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingFeed}
                  className="group px-8 py-3 bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-black/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-1"
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
              <div className="text-center py-12 px-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-600 font-semibold mb-2">
                  🎉 You're all caught up!
                </p>
                <p className="text-sm text-gray-500">
                  Check back later for more posts
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-6">
            <div className="text-6xl mb-6 animate-bounce">📝</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No posts yet
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Be the first to share something amazing with the community!
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-black/20 transition-all duration-200 hover:-translate-y-1"
              >
                <FiPlus
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
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
