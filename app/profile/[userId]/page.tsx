"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getUserProfile,
  getUserPosts,
  toggleFollow,
  UserProfile,
} from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          getUserProfile(userId),
          getUserPosts(userId, 1, 10),
        ]);

        if (profileRes.success) {
          setProfile(profileRes.data?.profile || null);
        }

        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data.posts || []);
          setTotalPages(postsRes.data.pagination?.totalPages || 1);
        }

        setError(null);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message || "Failed to load profile";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const handleLoadMore = async () => {
    if (currentPage >= totalPages) return;

    try {
      const nextPage = currentPage + 1;
      const res = await getUserPosts(userId, nextPage, 10);
      const data = res.data;

      if (res.success && data?.posts) {
        setPosts((prev) => [...prev, ...data.posts]);
        setCurrentPage(nextPage);
      }
    } catch (err: any) {
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
          <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
          <p className="text-gray-500 mt-1">
            {posts.length} {posts.length === 1 ? "post" : "posts"} by{" "}
            {profile.name}
          </p>
        </div>

        {posts.length > 0 ? (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">No posts yet</div>
            <p className="text-gray-600 text-lg">
              {profile.isOwnProfile
                ? "Start by creating your first post."
                : `${profile.name} has not posted anything yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
