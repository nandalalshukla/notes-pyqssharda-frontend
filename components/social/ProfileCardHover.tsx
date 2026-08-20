"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getUserProfile, UserProfile } from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import { FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import VerifiedBadge from "./VerifiedBadge";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

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
      className={cn(
        "animate-in fade-in zoom-in-95 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg duration-200",
        className,
      )}
    >
      {isLoading ? (
        <div className="flex h-96 items-center justify-center bg-card">
          <div className="flex flex-col items-center gap-2">
            <FiLoader className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : profile ? (
        <div>
          {/* Profile Header Section */}
          <div className="px-5 pt-5 pb-4">
            {/* Top: Profile Pic + Follow Button */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <Link
                href={`/profile/${profile._id}`}
                onClick={() => onClose?.()}
                className="shrink-0 transition-opacity hover:opacity-90"
              >
                <Avatar src={profile.profilePic?.url} alt={profile.username} size="lg" />
              </Link>

              {/* Follow/Following Button */}
              {!profile.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer",
                    isFollowingCurrent
                      ? "border-2 border-border bg-card text-foreground hover:bg-secondary"
                      : "bg-primary text-primary-foreground hover:bg-primary-hover",
                    isFollowLoading && "cursor-not-allowed opacity-60",
                  )}
                >
                  {isFollowLoading ? (
                    <FiLoader className="inline h-4 w-4 animate-spin" />
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
              className="group mb-1 inline-block"
            >
              <div className="flex items-center gap-1">
                <h2 className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                  {profile.name}
                </h2>
                <VerifiedBadge role={profile.role} size={14} />
              </div>
            </Link>

            {/* Username */}
            <p className="mb-3 line-clamp-1 text-sm text-muted-foreground">
              @{profile.username}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p className="mb-4 line-clamp-2 text-sm leading-snug text-foreground">
                {profile.bio}
              </p>
            )}

            {/* Stats Grid */}
            <div className="mb-4 grid grid-cols-3 gap-0 text-center">
              <div className="border-r border-border py-2">
                <p className="text-base font-bold text-foreground">
                  {profile.stats.postsCount}
                </p>
                <p className="text-xs text-muted-foreground">posts</p>
              </div>
              <div className="border-r border-border py-2">
                <p className="text-base font-bold text-foreground">
                  {profile.stats.followersCount}
                </p>
                <p className="text-xs text-muted-foreground">followers</p>
              </div>
              <div className="py-2">
                <p className="text-base font-bold text-foreground">
                  {profile.stats.followingCount}
                </p>
                <p className="text-xs text-muted-foreground">following</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-4">
              <Link
                href={`/profile/${profile._id}`}
                onClick={() => onClose?.()}
                className="flex items-center justify-center rounded-xl border-2 border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
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
