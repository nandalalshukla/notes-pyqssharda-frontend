"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import { FiUserPlus, FiUserMinus, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import VerifiedBadge from "./VerifiedBadge";

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
      <div className="fixed z-50 w-64 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-xl">
        <p className="text-sm text-gray-600">{error}</p>
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
      className="w-80 rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto overflow-hidden"
    >
      {/* Loading State */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Loading profile...</p>
          </div>
        </div>
      ) : profile ? (
        <>
          {/* Professional Gradient Header - Vibrant */}
          <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          {/* Profile Content */}
          <div className="relative px-5 pb-5">
            {/* Profile Picture - Overlapping */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="relative -mt-10 flex-shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  {profile.profilePic?.url ? (
                    <Image
                      src={profile.profilePic.url}
                      alt={profile.username}
                      width={96}
                      height={96}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-950 text-xl font-bold text-white">
                      {profile.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Follow Button - Skip if own profile (client-side or API) */}
              {!isOwnProfileLocal && !displayedProfile?.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`mt-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    storeFollowStatus
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md"
                  }`}
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
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {profile.name}
                  </h3>
                  <VerifiedBadge role={profile.role} size={14} />
                </div>
              </Link>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Course/Role Info */}
            {profile.course && (
              <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 border border-blue-100">
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Course:</span>{" "}
                  {profile.course}
                </p>
              </div>
            )}

            {/* Stats Grid with Dividers */}
            <div className="mb-4 grid grid-cols-3 gap-0 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
              <div className="px-3 py-3 text-center border-r border-gray-200 last:border-r-0 hover:bg-gray-100 transition-colors">
                <p className="text-sm font-bold text-gray-900">
                  {displayedProfile?.stats.postsCount}
                </p>
                <p className="text-xs text-gray-600 mt-1">Posts</p>
              </div>
              <div className="px-3 py-3 text-center border-r border-gray-200 last:border-r-0 hover:bg-gray-100 transition-colors">
                <p className="text-sm font-bold text-gray-900">
                  {displayedProfile?.stats.followersCount}
                </p>
                <p className="text-xs text-gray-600 mt-1">Followers</p>
              </div>
              <div className="px-3 py-3 text-center hover:bg-gray-100 transition-colors">
                <p className="text-sm font-bold text-gray-900">
                  {displayedProfile?.stats.followingCount}
                </p>
                <p className="text-xs text-gray-600 mt-1">Following</p>
              </div>
            </div>

            {/* View Profile Button */}
            <Link
              href={`/profile/${profile._id}`}
              onClick={() => onClose?.()}
              className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-md active:scale-95"
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
