"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getUserProfile,
  toggleFollow,
  Post,
  UserProfile,
} from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import PostCard from "@/components/social/PostCard";
import ProfileHeader from "@/components/social/ProfileHeader";
import { FeedLoadingState } from "@/components/social/LoadingSkeletons";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const userId = params.userId as string;
  const {
    userPosts,
    userPostsPage,
    userPostsTotalPages,
    isLoadingUserPosts,
    fetchUserPosts,
  } = useSocialStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const posts = userPosts.get(userId) || [];
  const currentPage = userPostsPage.get(userId) || 1;
  const totalPages = userPostsTotalPages.get(userId) || 1;
  const isPostsLoading = isLoadingUserPosts.get(userId) ?? true;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile and posts in parallel
        const profilePromise = getUserProfile(userId);
        const postsPromise = fetchUserPosts(userId, 1);

        const [profileRes] = await Promise.all([profilePromise, postsPromise]);

        if (profileRes.success) {
          setProfile(profileRes.data?.profile || null);
        } else {
          throw new Error(profileRes.message || "Failed to load profile");
        }

        setError(null);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load profile data";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchInitialData();
    }
  }, [userId, fetchUserPosts]);

  const handleLoadMore = async () => {
    if (currentPage >= totalPages || isPostsLoading) return;

    try {
      await fetchUserPosts(userId, currentPage + 1);
    } catch {
      toast.error("Failed to load more posts");
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      router.push("/auth/login");
      return;
    }

    if (!profile) return;

    setIsFollowLoading(true);
    try {
      const res = await toggleFollow(userId);

      if (res.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowedByCurrentUser: !prev.isFollowedByCurrentUser,
                stats: {
                  ...prev.stats,
                  followersCount: prev.isFollowedByCurrentUser
                    ? prev.stats.followersCount - 1
                    : prev.stats.followersCount + 1,
                },
              }
            : null,
        );

        toast.success(
          profile.isFollowedByCurrentUser ? "Unfollowed" : "Followed",
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update follow status",
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FeedLoadingState />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || "Profile not found"}
          </h1>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiArrowLeft size={18} />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <FiArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <ProfileHeader
        profile={profile}
        onFollowToggle={handleFollowToggle}
        isFollowLoading={isFollowLoading}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
          {isPostsLoading && posts.length === 0 ? (
            <FeedLoadingState />
          ) : posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-700">
                No posts yet
              </h3>
              <p className="text-gray-500 mt-2">
                This user hasn't shared any posts.
              </p>
            </div>
          )}
        </div>

        {currentPage < totalPages && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={isPostsLoading}
              className="bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPostsLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
