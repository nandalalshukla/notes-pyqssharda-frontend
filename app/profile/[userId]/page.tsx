"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import PostCard from "@/components/social/PostCard";
import ProfileHeader from "@/components/social/ProfileHeader";
import { ProfilePageLoadingState } from "@/components/social/LoadingSkeletons";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { Button, EmptyState } from "@/components/ui";

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
    fetchUserProfile,
    toggleUserFollow,
    followStats,
    userProfiles,
    isLoadingUserProfiles,
  } = useSocialStore();

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Get profile from store cache
  const profile = userProfiles.get(userId);
  const isLoadingProfile = isLoadingUserProfiles.get(userId) ?? true;

  const posts = userPosts.get(userId) || [];
  const currentPage = userPostsPage.get(userId) || 1;
  const totalPages = userPostsTotalPages.get(userId) || 1;
  const isPostsLoading = isLoadingUserPosts.get(userId) ?? true;
  const profileFollowStats = followStats.get(userId);

  // Client-side validation of own profile (backup for API)
  const isOwnProfileLocal = currentUser?._id === userId;

  // Use profile from store with followStats overrides
  const displayedProfile = profile
    ? {
        ...profile,
        // Override with client-side validation as backup
        isOwnProfile: isOwnProfileLocal || profile.isOwnProfile,
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
    // Fetch profile and posts in parallel from store
    if (userId) {
      Promise.all([fetchUserProfile(userId), fetchUserPosts(userId, 1)]);
    }
  }, [userId, fetchUserProfile, fetchUserPosts]);

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
      await toggleUserFollow(userId, wasFollowing);
      toast.success(wasFollowing ? "Unfollowed" : "Followed");
    } catch (err: unknown) {
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoadingProfile && !displayedProfile) {
    return (
      <div className="min-h-screen bg-background">
        <ProfilePageLoadingState />
      </div>
    );
  }

  if (!displayedProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <EmptyState
          icon={<span className="text-4xl">⚠️</span>}
          title="Profile not found"
          description="The profile you're looking for doesn't exist."
          action={
            <Link href="/library">
              <Button icon={<FiArrowLeft size={18} />}>Back to Feed</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
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

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="mb-8 text-3xl font-bold text-foreground">Posts</h2>
          {isPostsLoading && posts.length === 0 ? (
            <ProfilePageLoadingState />
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<span className="text-2xl">📝</span>}
              title="No posts yet"
              description="This user hasn't shared any posts."
            />
          )}
        </div>

        {currentPage < totalPages && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              loading={isPostsLoading}
              size="lg"
              className="px-8"
            >
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
