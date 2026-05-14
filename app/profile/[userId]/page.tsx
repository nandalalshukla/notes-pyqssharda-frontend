"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getUserProfile,
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

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
};

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
    toggleUserFollow,
    followStats,
  } = useSocialStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const posts = userPosts.get(userId) || [];
  const currentPage = userPostsPage.get(userId) || 1;
  const totalPages = userPostsTotalPages.get(userId) || 1;
  const isPostsLoading = isLoadingUserPosts.get(userId) ?? true;
  const profileFollowStats = followStats.get(userId);
  const displayedProfile = profile
    ? {
        ...profile,
        isFollowedByCurrentUser:
          profileFollowStats?.isFollowedByCurrentUser ??
          profile.isFollowedByCurrentUser,
        stats: {
          ...profile.stats,
          followersCount:
            profileFollowStats?.followerCount ?? profile.stats.followersCount,
          followingCount:
            profileFollowStats?.followingCount ?? profile.stats.followingCount,
        },
      }
    : null;

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
      } catch (err: unknown) {
        const errorMsg = getRequestErrorMessage(
          err,
          "Failed to load profile data",
        );
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

    if (!displayedProfile) return;

    setIsFollowLoading(true);
    const wasFollowing = displayedProfile.isFollowedByCurrentUser;
    try {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowedByCurrentUser: !wasFollowing,
              stats: {
                ...prev.stats,
                followersCount: Math.max(
                  0,
                  prev.stats.followersCount + (wasFollowing ? -1 : 1),
                ),
              },
            }
          : null,
      );

      await toggleUserFollow(userId, wasFollowing);
      toast.success(wasFollowing ? "Unfollowed" : "Followed");
    } catch (err: unknown) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowedByCurrentUser: wasFollowing,
              stats: {
                ...prev.stats,
                followersCount: Math.max(
                  0,
                  prev.stats.followersCount + (wasFollowing ? 1 : -1),
                ),
              },
            }
          : null,
      );
      toast.error(
        getRequestErrorMessage(err, "Failed to update follow status"),
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <FeedLoadingState />
      </div>
    );
  }

  if (error || !displayedProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            {error || "Profile not found"}
          </h1>
          <p className="text-slate-500 mb-6">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiArrowLeft size={18} />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <FiArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <ProfileHeader
        profile={displayedProfile}
        onFollowToggle={handleFollowToggle}
        isFollowLoading={isFollowLoading}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Posts</h2>
          {isPostsLoading && posts.length === 0 ? (
            <FeedLoadingState />
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No posts yet
              </h3>
              <p className="text-slate-500">
                This user hasn&apos;t shared any posts.
              </p>
            </div>
          )}
        </div>

        {currentPage < totalPages && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={isPostsLoading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isPostsLoading ? "Loading..." : "Load More Posts"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
