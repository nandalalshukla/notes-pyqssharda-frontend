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
  const { feed, feedPage, feedTotalPages, isLoadingFeed, fetchFeed } =
    useSocialStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFeed(currentPage);
  }, [currentPage, fetchFeed]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < feedTotalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, feedTotalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b-2 border-black backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-black">Social Feed</h1>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold border-2 border-transparent rounded-lg hover:bg-white hover:text-black hover:border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <FiPlus size={20} />
              <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-6 mb-8 text-center">
            <p className="text-lg font-bold text-blue-900 mb-2">
              Sign in to share your thoughts
            </p>
            <p className="text-sm text-blue-700">
              Create posts, comment, and connect with your community
            </p>
          </div>
        )}

        {isLoadingFeed && feed.length === 0 ? (
          <FeedLoadingState />
        ) : feed.length > 0 ? (
          <div>
            <div className="space-y-6">
              {feed.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {feedTotalPages > currentPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingFeed}
                  className="px-8 py-3 bg-black text-white font-bold border-2 border-transparent rounded-lg hover:bg-white hover:text-black hover:border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  {isLoadingFeed ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {currentPage === feedTotalPages && feed.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-600 font-semibold">
                  You've reached the end of the feed
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
            <p className="text-gray-600 mb-6">
              Be the first to share something amazing!
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-black text-white font-bold border-2 border-transparent rounded-lg hover:bg-white hover:text-black hover:border-black transition-all"
              >
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
