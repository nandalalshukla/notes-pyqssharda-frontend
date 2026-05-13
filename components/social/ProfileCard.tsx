"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getUserProfile,
  UserProfile,
  toggleFollow,
} from "@/lib/api/social/social.api";
import useAuthStore from "@/stores/user/authStore";
import { FiUserPlus, FiUserMinus, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

interface ProfileCardProps {
  userId: string;
  position?: "top" | "bottom";
  onClose?: () => void;
  onMouseEnter?: () => void;
}

const ProfileCard = ({
  userId,
  position = "top",
  onClose,
  onMouseEnter,
}: ProfileCardProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: currentUser } = useAuthStore();

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getUserProfile(userId);
        if (response.data?.profile) {
          const profileData = response.data.profile;
          setProfile(profileData);
          setIsFollowing(profileData.isFollowedByCurrentUser || false);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Handle follow/unfollow
  const handleFollowToggle = useCallback(async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    if (profile?.isOwnProfile) {
      return;
    }

    setIsFollowLoading(true);
    try {
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "User unfollowed" : "User followed!");
    } catch (error) {
      console.error("Failed to update follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  }, [userId, currentUser, profile?.isOwnProfile, isFollowing]);

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
      className="w-80 rounded-xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto overflow-hidden"
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

              {/* Follow Button */}
              {!profile.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`mt-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isFollowing
                      ? "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  } ${isFollowLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isFollowLoading ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
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
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {profile.name}
                </h3>
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
              <div className="mb-4 rounded-md bg-gray-50 px-3 py-2 border border-gray-100">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Course:</span>{" "}
                  {profile.course}
                </p>
              </div>
            )}

            {/* Stats Grid with Dividers */}
            <div className="mb-4 grid grid-cols-3 gap-0 rounded-md bg-gray-50 border border-gray-100 overflow-hidden">
              <div className="px-3 py-3 text-center border-r border-gray-100 last:border-r-0">
                <p className="text-sm font-bold text-gray-900">
                  {profile.stats.postsCount}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Posts</p>
              </div>
              <div className="px-3 py-3 text-center border-r border-gray-100 last:border-r-0">
                <p className="text-sm font-bold text-gray-900">
                  {profile.stats.followersCount}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Followers</p>
              </div>
              <div className="px-3 py-3 text-center">
                <p className="text-sm font-bold text-gray-900">
                  {profile.stats.followingCount}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Following</p>
              </div>
            </div>

            {/* View Profile Button */}
            <Link
              href={`/profile/${profile._id}`}
              onClick={() => onClose?.()}
              className="block w-full rounded-md bg-gray-900 py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 active:scale-95"
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
