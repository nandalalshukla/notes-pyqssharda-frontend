"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import { FiUserPlus, FiUserMinus, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import VerifiedBadge from "./VerifiedBadge";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface ProfileCardProps {
  userId: string;
  position?: "top" | "bottom";
  onClose?: () => void;
  onMouseEnter?: () => void;
}

const ProfileCard = ({ userId, onClose, onMouseEnter }: ProfileCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuthStore();

  // Subscribe to store for profile, follow status, and loading states
  const {
    toggleUserFollow,
    followStats,
    userProfiles,
    isLoadingUserProfiles,
    fetchUserProfile,
    error,
  } = useSocialStore();

  // Get profile from store cache
  const profile = userProfiles.get(userId);
  const isLoading = isLoadingUserProfiles.get(userId) ?? true;

  const storeFollowStatus = followStats.get(userId)?.isFollowedByCurrentUser;
  const profileFollowStats = followStats.get(userId);

  // Client-side validation of own profile (backup for API)
  const isOwnProfileLocal = currentUser?._id === userId;

  // Merge store stats with profile data for consistent display
  const displayedProfile = profile
    ? {
        ...profile,
        isFollowedByCurrentUser:
          storeFollowStatus ?? profile.isFollowedByCurrentUser,
        stats: {
          ...profile.stats,
          followersCount:
            profileFollowStats?.followerCount ?? profile.stats.followersCount,
          followingCount:
            profileFollowStats?.followingCount ?? profile.stats.followingCount,
        },
      }
    : null;

  // Fetch profile on mount or when userId changes
  useEffect(() => {
    fetchUserProfile(userId);
  }, [userId, fetchUserProfile]);

  // Handle follow/unfollow - use store action for sync
  const handleFollowToggle = useCallback(async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    // Don't allow following own profile (client-side validation is primary)
    if (isOwnProfileLocal) {
      return;
    }

    try {
      const isCurrentlyFollowing = storeFollowStatus ?? false;
      await toggleUserFollow(userId, isCurrentlyFollowing);
      toast.success(
        isCurrentlyFollowing ? "User unfollowed" : "User followed!",
      );
    } catch (err) {
      console.error("Failed to update follow status:", err);
      toast.error("Failed to update follow status");
    }
  }, [
    userId,
    currentUser,
    isOwnProfileLocal,
    storeFollowStatus,
    toggleUserFollow,
  ]);

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  // Handle mouse enter to keep card open
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  if (error) {
    return (
      <div className="fixed z-50 w-64 rounded-2xl border border-border bg-card p-4 text-center shadow-soft-lg">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => {
        handleMouseEnter();
        onMouseEnter?.();
      }}
      onMouseLeave={handleMouseLeave}
      className="animate-in fade-in zoom-in-95 pointer-events-auto w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg transition-shadow duration-300 hover:shadow-soft-lg"
    >
      {/* Loading State */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      ) : profile ? (
        <>
          {/* Gradient Header */}
          <div className="h-24 bg-gradient-to-r from-primary via-accent-purple to-accent-sky" />

          {/* Profile Content */}
          <div className="relative px-5 pb-5">
            {/* Profile Picture - Overlapping */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="relative -mt-10 shrink-0 rounded-full ring-4 ring-card">
                <Avatar src={profile.profilePic?.url} alt={profile.username} size="xl" />
              </div>

              {/* Follow Button - Skip if own profile (client-side or API) */}
              {!isOwnProfileLocal && !displayedProfile?.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={cn(
                    "mt-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer",
                    storeFollowStatus
                      ? "border border-border bg-secondary text-foreground hover:bg-secondary-hover"
                      : "bg-primary text-primary-foreground shadow-soft-sm hover:bg-primary-hover hover:shadow-soft-md active:scale-95",
                  )}
                >
                  {storeFollowStatus ? (
                    <>
                      <FiUserMinus className="h-4 w-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="h-4 w-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="mb-4">
              <Link
                href={`/profile/${profile._id}`}
                className="group mb-1 inline-block"
                onClick={() => onClose?.()}
              >
                <div className="flex items-center gap-1">
                  <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                    {profile.name}
                  </h3>
                  <VerifiedBadge role={profile.role} size={14} />
                </div>
              </Link>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 line-clamp-2 text-sm text-foreground">{profile.bio}</p>
              )}
            </div>

            {/* Course/Role Info */}
            {profile.course && (
              <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2">
                <p className="text-xs text-primary">
                  <span className="font-semibold">Course:</span> {profile.course}
                </p>
              </div>
            )}

            {/* Stats Grid with Dividers */}
            <div className="mb-4 grid grid-cols-3 gap-0 overflow-hidden rounded-xl border border-border bg-muted">
              <div className="border-r border-border px-3 py-3 text-center transition-colors last:border-r-0 hover:bg-secondary">
                <p className="text-sm font-bold text-foreground">
                  {displayedProfile?.stats.postsCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="border-r border-border px-3 py-3 text-center transition-colors last:border-r-0 hover:bg-secondary">
                <p className="text-sm font-bold text-foreground">
                  {displayedProfile?.stats.followersCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="px-3 py-3 text-center transition-colors hover:bg-secondary">
                <p className="text-sm font-bold text-foreground">
                  {displayedProfile?.stats.followingCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Following</p>
              </div>
            </div>

            {/* View Profile Button */}
            <Link
              href={`/profile/${profile._id}`}
              onClick={() => onClose?.()}
              className="block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-soft-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-soft-md active:scale-95"
            >
              View Full Profile
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ProfileCard;
