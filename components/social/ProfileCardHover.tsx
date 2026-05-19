"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile, UserProfile } from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import { FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import VerifiedBadge from "./VerifiedBadge";

interface ProfileCardHoverProps {
  userId: string;
  onClose?: () => void;
  onMouseEnter?: () => void;
  className?: string;
}

const ProfileCardHover = ({
  userId,
  onClose,
  onMouseEnter,
  className = "",
}: ProfileCardHoverProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuthStore();
  const { toggleUserFollow, followStats } = useSocialStore();
  const storeFollowStatus = followStats.get(userId)?.isFollowedByCurrentUser;
  const isFollowingCurrent = storeFollowStatus ?? isFollowing;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileRes = await getUserProfile(userId);
        if (profileRes.data?.profile) {
          const profileData = profileRes.data.profile;
          setProfile(profileData);
          setIsFollowing(profileData.isFollowedByCurrentUser || false);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    if (profile?.isOwnProfile) {
      return;
    }

    setIsFollowLoading(true);
    const previousFollowingState = isFollowingCurrent;
    try {
      setIsFollowing(!isFollowingCurrent);
      await toggleUserFollow(userId, isFollowingCurrent);
      toast.success(isFollowingCurrent ? "User unfollowed" : "User followed!");
    } catch (error) {
      setIsFollowing(previousFollowingState);
      console.error("Failed to update follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  }, [
    userId,
    currentUser,
    profile?.isOwnProfile,
    isFollowingCurrent,
    toggleUserFollow,
  ]);

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 250);
  };

  const handleMouseEnterLocal = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    onMouseEnter?.();
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnterLocal}
      onMouseLeave={handleMouseLeave}
      className={`w-80 bg-white border border-gray-200 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${className}`}
    >
      {isLoading ? (
        <div className="flex h-96 items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-2">
            <FiLoader className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      ) : profile ? (
        <div className="bg-white">
          {/* Profile Header Section */}
          <div className="px-5 pt-5 pb-4">
            {/* Top: Profile Pic + Follow Button */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <Link
                href={`/profile/${profile._id}`}
                onClick={() => onClose?.()}
                className="flex-shrink-0"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 overflow-hidden border-2 border-gray-100 hover:opacity-90 transition-opacity">
                  {profile.profilePic?.url ? (
                    <Image
                      src={profile.profilePic.url}
                      alt={profile.username}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                      {profile.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>

              {/* Follow/Following Button */}
              {!profile.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    isFollowingCurrent
                      ? "border-2 border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } ${isFollowLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isFollowLoading ? (
                    <FiLoader className="h-4 w-4 animate-spin inline" />
                  ) : isFollowingCurrent ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              )}
            </div>

            {/* Name & Verified Badge */}
            <Link
              href={`/profile/${profile._id}`}
              onClick={() => onClose?.()}
              className="group inline-block mb-1"
            >
              <div className="flex items-center gap-1">
                <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {profile.name}
                </h2>
                <VerifiedBadge role={profile.role} size={14} />
              </div>
            </Link>

            {/* Username */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              @{profile.username}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-gray-800 leading-snug mb-4 line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Stats Grid - Instagram Style */}
            <div className="grid grid-cols-3 gap-0 mb-4 text-center">
              <div className="border-r border-gray-200 py-2">
                <p className="text-base font-bold text-gray-900">
                  {profile.stats.postsCount}
                </p>
                <p className="text-xs text-gray-600">posts</p>
              </div>
              <div className="border-r border-gray-200 py-2">
                <p className="text-base font-bold text-gray-900">
                  {profile.stats.followersCount}
                </p>
                <p className="text-xs text-gray-600">followers</p>
              </div>
              <div className="py-2">
                <p className="text-base font-bold text-gray-900">
                  {profile.stats.followingCount}
                </p>
                <p className="text-xs text-gray-600">following</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-4">
              <Link
                href={`/profile/${profile._id}`}
                onClick={() => onClose?.()}
                className="flex items-center justify-center py-2 px-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileCardHover;
